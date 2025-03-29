
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseConnection } from './entities/database-connection.entity';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(DatabaseConnection)
    private connectionRepository: Repository<DatabaseConnection>,
  ) {}

  async findAll(userId: string): Promise<DatabaseConnection[]> {
    return this.connectionRepository.find({ 
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string, userId: string): Promise<DatabaseConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { id, user: { id: userId } }
    });
    
    if (!connection) {
      throw new NotFoundException(`Database connection with ID ${id} not found`);
    }
    
    return connection;
  }

  async create(createConnectionDto: CreateConnectionDto, userId: string): Promise<DatabaseConnection> {
    await this.testConnection(createConnectionDto);

    const connection = this.connectionRepository.create({
      ...createConnectionDto,
      user: { id: userId },
    });
    
    return this.connectionRepository.save(connection);
  }

  async update(id: string, updateConnectionDto: CreateConnectionDto, userId: string): Promise<DatabaseConnection> {
    await this.findOne(id, userId);
    await this.testConnection(updateConnectionDto);
    await this.connectionRepository.update(
      { id, user: { id: userId } },
      { ...updateConnectionDto }
    );
    
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const connection = await this.findOne(id, userId);
    await this.connectionRepository.remove(connection);
  }

  async testConnection(connectionDetails: CreateConnectionDto): Promise<boolean> {
    const client = new Client({
      host: connectionDetails.host,
      port: connectionDetails.port,
      database: connectionDetails.database,
      user: connectionDetails.username,
      password: connectionDetails.password,
      ssl: connectionDetails.sslEnabled 
        ? connectionDetails.sslConfig || { rejectUnauthorized: false }
        : undefined,
    });

    try {
      await client.connect();
      await client.query('SELECT NOW()');
      
      return true;
    } catch (error) {
      throw new BadRequestException(`Could not connect to database: ${error.message}`);
    } finally {
      await client.end().catch(() => {});
    }
  }
}
