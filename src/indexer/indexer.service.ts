import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Indexer, IndexerCategory, IndexerStatus } from './entities/indexer.entity';
import { CreateIndexerDto } from './dto/create-indexer.dto';
import { SchemaGeneratorService } from './schema-generator.service';
import { DataTransformerService } from './data-transformer.service';
import { DatabaseConnectorService } from './database-connector.service';
import { DatabaseService } from '../database/database.service';
import { HeliusService } from '../helius/helius.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    @InjectRepository(Indexer)
    private indexerRepository: Repository<Indexer>,
    private schemaGeneratorService: SchemaGeneratorService,
    private dataTransformerService: DataTransformerService,
    private databaseConnectorService: DatabaseConnectorService,
    private databaseService: DatabaseService,
    private heliusService: HeliusService,
    private configService: ConfigService,
  ) {}

  async findAll(userId: string): Promise<Indexer[]> {
    return this.indexerRepository.find({
      where: { user: { id: userId } },
      relations: ['databaseConnection'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, userId: string): Promise<Indexer> {
    const indexer = await this.indexerRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['databaseConnection']
    });
    
    if (!indexer) {
      throw new NotFoundException(`Indexer with ID ${id} not found`);
    }
    
    return indexer;
  }

  async create(createIndexerDto: CreateIndexerDto, userId: string): Promise<Indexer> {
    const dbConnection = await this.databaseService.findOne(
      createIndexerDto.databaseConnectionId,
      userId
    );

    const schema = this.schemaGeneratorService.generateSchema(
      createIndexerDto.category,
      createIndexerDto.customSchema,
      createIndexerDto.configuration
    );

    const indexer = this.indexerRepository.create({
      name: createIndexerDto.name,
      category: createIndexerDto.category,
      configuration: createIndexerDto.configuration,
      schema,
      user: { id: userId },
      databaseConnection: { id: dbConnection.id },
    });
    
    const savedIndexer = await this.indexerRepository.save(indexer);
    
    try {
      const client = await this.databaseConnectorService.getClient(dbConnection);
      await this.databaseConnectorService.createTable(client, schema);
      savedIndexer.status = IndexerStatus.INACTIVE;
      await this.indexerRepository.save(savedIndexer);
      
      await this.setupWebhook(savedIndexer);
      
      return await this.findOne(savedIndexer.id, userId);
    } catch (error) {
      savedIndexer.status = IndexerStatus.ERROR;
      savedIndexer.lastError = error.message;
      await this.indexerRepository.save(savedIndexer);
      
      throw error;
    }
  }

  async update(id: string, updateIndexerDto: CreateIndexerDto, userId: string): Promise<Indexer> {
    const indexer = await this.findOne(id, userId);
    let newDbConnection = indexer.databaseConnection;
    if (updateIndexerDto.databaseConnectionId !== indexer.databaseConnection.id) {
      newDbConnection = await this.databaseService.findOne(
        updateIndexerDto.databaseConnectionId,
        userId
      );
    }
    const schema = this.schemaGeneratorService.generateSchema(
      updateIndexerDto.category,
      updateIndexerDto.customSchema,
      updateIndexerDto.configuration
    );
    const oldStatus = indexer.status;
    indexer.status = IndexerStatus.PAUSED;
    await this.indexerRepository.save(indexer);
    
    try {
      if (
        updateIndexerDto.category !== indexer.category ||
        JSON.stringify(updateIndexerDto.configuration) !== JSON.stringify(indexer.configuration)
      ) {
        await this.updateWebhook(indexer, updateIndexerDto.configuration);
      }
      
      await this.indexerRepository.update(id, {
        name: updateIndexerDto.name,
        category: updateIndexerDto.category,
        configuration: updateIndexerDto.configuration,
        schema,
        databaseConnection: { id: newDbConnection.id },
        status: oldStatus, 
      });
      
      return await this.findOne(id, userId);
    } catch (error) {
      await this.indexerRepository.update(id, {
        status: IndexerStatus.ERROR,
        lastError: error.message,
      });
      
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const indexer = await this.findOne(id, userId);
    if (indexer.webhookId) {
      try {
        await this.heliusService.deleteWebhook(indexer.webhookId);
      } catch (error) {
        this.logger.warn(`Failed to delete webhook: ${error.message}`);
      }
    }
    
    await this.indexerRepository.remove(indexer);
  }

  async activate(id: string, userId: string): Promise<Indexer> {
    const indexer = await this.findOne(id, userId);
    
    if (indexer.status === IndexerStatus.ACTIVE) {
      return indexer;
    }
    
    if (!indexer.webhookId) {
      await this.setupWebhook(indexer);
    }
    
    indexer.status = IndexerStatus.ACTIVE;
    await this.indexerRepository.save(indexer);
    
    return indexer;
  }

  async deactivate(id: string, userId: string): Promise<Indexer> {
    const indexer = await this.findOne(id, userId);
    
    if (indexer.status === IndexerStatus.INACTIVE) {
      return indexer;
    }
    
    indexer.status = IndexerStatus.INACTIVE;
    await this.indexerRepository.save(indexer);
    
    return indexer;
  }

  async processWebhookEvent(webhookData: any): Promise<void> {
    if (!Array.isArray(webhookData)) {
      webhookData = [webhookData];
    }
    
    const activeIndexers = await this.indexerRepository.find({
      where: { status: IndexerStatus.ACTIVE },
      relations: ['databaseConnection'],
    });
    
    for (const indexer of activeIndexers) {
      try {
        const transformedData = this.dataTransformerService.transformWebhookData(
          webhookData,
          indexer.category,
          indexer.configuration
        );
        
        if (transformedData.length === 0) {
          continue;
        }

        const client = await this.databaseConnectorService.getClient(indexer.databaseConnection);
        
        await this.databaseConnectorService.insertData(
          client,
          indexer.schema.tableName,
          transformedData
        );
        
        await this.indexerRepository.update(indexer.id, {
          eventsProcessed: () => `"eventsProcessed" + ${transformedData.length}`,
          lastProcessedAt: new Date(),
        });
      } catch (error) {
        this.logger.error(`Error processing webhook for indexer ${indexer.id}: ${error.message}`);
        
        await this.indexerRepository.update(indexer.id, {
          status: IndexerStatus.ERROR,
          lastError: error.message,
        });
      }
    }
  }

  private async setupWebhook(indexer: Indexer): Promise<void> {
    try {
      console.log('Using temporary webhook ID for testing');
      indexer.webhookId = 'dev-test-' + Date.now();
      

      await this.indexerRepository.save(indexer);
      
      return; // Skip the rest of the method
      
      // The following code is commented out temporarily
      /*
      // Determine what addresses to track based on the indexer configuration
      const accountAddresses = this.getAccountAddressesFromConfig(indexer.configuration);
      
      // Determine what transaction types to track
      const transactionTypes = this.getTransactionTypesForCategory(indexer.category);
      
      // Generate a webhook URL
      const baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      const webhookUrl = `${baseUrl}/webhook`;
      
      // Register the webhook with Helius
      const webhookResponse = await this.heliusService.registerWebhook(
        webhookUrl,
        accountAddresses,
        transactionTypes
      );
      
      // Save the webhook ID
      indexer.webhookId = webhookResponse.webhookID;
      await this.indexerRepository.save(indexer);
      */
    } catch (error) {
      throw new Error(`Failed to set up webhook: ${error.message}`);
    }
  }
  private async updateWebhook(indexer: Indexer, newConfiguration: any): Promise<void> {
    try {
      if (!indexer.webhookId) {
        await this.setupWebhook(indexer);
        return;
      }
      
      const accountAddresses = this.getAccountAddressesFromConfig(newConfiguration);
      const transactionTypes = this.getTransactionTypesForCategory(indexer.category);
      await this.heliusService.updateWebhook(
        indexer.webhookId,
        accountAddresses,
        transactionTypes
      );
    } catch (error) {
      throw new Error(`Failed to update webhook: ${error.message}`);
    }
  }

  private getAccountAddressesFromConfig(configuration: any): string[] {
    const addresses: string[] = [];
    if (configuration.collections && Array.isArray(configuration.collections)) {
      addresses.push(...configuration.collections);
    }

    if (configuration.tokens && Array.isArray(configuration.tokens)) {
      addresses.push(...configuration.tokens);
    }
    
    if (configuration.marketplaces && Array.isArray(configuration.marketplaces)) {
      addresses.push(...configuration.marketplaces);
    }
    
    if (configuration.platforms && Array.isArray(configuration.platforms)) {
      addresses.push(...configuration.platforms);
    }
    
    return addresses;
  }

  private getTransactionTypesForCategory(category: IndexerCategory): string[] {
    switch (category) {
      case IndexerCategory.NFT_BIDS:
        return ['NFT_BID'];
      
      case IndexerCategory.NFT_PRICES:
        return ['NFT_SALE', 'NFT_LISTING', 'NFT_CANCEL'];
      
      case IndexerCategory.TOKEN_LOANS:
        return ['LOAN_CREATE', 'LOAN_REPAY', 'LOAN_LIQUIDATE', 'LOAN_EXTEND'];
      
      case IndexerCategory.TOKEN_PRICES:
        return ['SWAP', 'TRADE', 'PRICE_UPDATE'];
      
      case IndexerCategory.CUSTOM:
      default:
        return [];
    }
  }
}