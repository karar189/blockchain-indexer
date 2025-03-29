import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexerService } from './indexer.service';
import { IndexerController } from './indexer.controller';
import { Indexer } from './entities/indexer.entity';
import { SchemaGeneratorService } from './schema-generator.service';
import { DataTransformerService } from './data-transformer.service';
import { DatabaseConnectorService } from './database-connector.service';
import { DatabaseModule } from '../database/database.module';
import { HeliusModule } from '../helius/helius.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Indexer]),
    DatabaseModule,
    HeliusModule,
  ],
  controllers: [IndexerController],
  providers: [
    IndexerService,
    SchemaGeneratorService,
    DataTransformerService,
    DatabaseConnectorService,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}