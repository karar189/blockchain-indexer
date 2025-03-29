import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DatabaseConnection } from '../../database/entities/database-connection.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum IndexerCategory {
  NFT_BIDS = 'NFT_BIDS',
  NFT_PRICES = 'NFT_PRICES',
  TOKEN_LOANS = 'TOKEN_LOANS',
  TOKEN_PRICES = 'TOKEN_PRICES',
  CUSTOM = 'CUSTOM',
}

export enum IndexerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PAUSED = 'PAUSED',
}

@Entity('indexers')
export class Indexer {
  @ApiProperty({ description: 'Unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the indexer', example: 'NFT Price Tracker' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Category of data being indexed', enum: IndexerCategory })
  @Column({ type: 'enum', enum: IndexerCategory })
  category: IndexerCategory;

  @ApiProperty({ description: 'Indexer configuration' })
  @Column({ type: 'json' })
  configuration: {
    collections?: string[]; // NFT collection addresses
    tokens?: string[]; // Token mint addresses
    marketplaces?: string[]; // Marketplace program IDs
    platforms?: string[]; // DeFi platform IDs
    customFilters?: Record<string, any>; // Custom filtering options
  };

  @ApiProperty({ description: 'Database schema configuration' })
  @Column({ type: 'json' })
  schema: {
    tableName: string;
    fields: Array<{
      name: string;
      type: string;
      isPrimary?: boolean;
      isNullable?: boolean;
    }>;
    indices?: Array<{
      name: string;
      columns: string[];
      isUnique?: boolean;
    }>;
  };

  @ApiProperty({ description: 'Helius webhook ID' })
  @Column({ nullable: true })
  webhookId: string;

  @ApiProperty({ description: 'Indexer status', enum: IndexerStatus })
  @Column({ type: 'enum', enum: IndexerStatus, default: IndexerStatus.INACTIVE })
  status: IndexerStatus;

  @ApiProperty({ description: 'Last error message', required: false })
  @Column({ nullable: true })
  lastError: string;

  @ApiProperty({ description: 'Events processed count' })
  @Column({ default: 0 })
  eventsProcessed: number;

  @ApiProperty({ description: 'Last processed timestamp', required: false })
  @Column({ nullable: true })
  lastProcessedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => DatabaseConnection, { onDelete: 'CASCADE' })
  databaseConnection: DatabaseConnection;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}