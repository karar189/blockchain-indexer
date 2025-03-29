import { IsNotEmpty, IsString, IsEnum, IsObject, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IndexerCategory } from '../entities/indexer.entity';
import { Type } from 'class-transformer';

class ConfigurationDto {
  @ApiProperty({ description: 'NFT collection addresses to monitor', type: [String], required: false })
  @IsArray()
  @IsOptional()
  collections?: string[];

  @ApiProperty({ description: 'Token addresses to monitor', type: [String], required: false })
  @IsArray()
  @IsOptional()
  tokens?: string[];

  @ApiProperty({ description: 'Marketplace program IDs to monitor', type: [String], required: false })
  @IsArray()
  @IsOptional()
  marketplaces?: string[];

  @ApiProperty({ description: 'DeFi platform IDs to monitor', type: [String], required: false })
  @IsArray()
  @IsOptional()
  platforms?: string[];

  @ApiProperty({ description: 'Custom filtering options', required: false })
  @IsOptional()
  customFilters?: Record<string, any>;
}

class SchemaFieldDto {
  @ApiProperty({ description: 'Field name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Field type (SQL)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Is primary key', required: false })
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Is nullable', required: false })
  @IsOptional()
  isNullable?: boolean;
}

class SchemaIndexDto {
  @ApiProperty({ description: 'Index name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Columns included in the index', type: [String] })
  @IsArray()
  columns: string[];

  @ApiProperty({ description: 'Is unique index', required: false })
  @IsOptional()
  isUnique?: boolean;
}

class CustomSchemaDto {
  @ApiProperty({ description: 'Table name', required: false })
  @IsString()
  @IsOptional()
  tableName?: string;

  @ApiProperty({ description: 'Table fields', type: [SchemaFieldDto], required: false })
  @IsArray()
  @IsOptional()
  @Type(() => SchemaFieldDto)
  fields?: SchemaFieldDto[];

  @ApiProperty({ description: 'Table indices', type: [SchemaIndexDto], required: false })
  @IsArray()
  @IsOptional()
  @Type(() => SchemaIndexDto)
  indices?: SchemaIndexDto[];
}

export class CreateIndexerDto {
  @ApiProperty({ description: 'Name of the indexer', example: 'NFT Price Tracker' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Category of data to index', enum: IndexerCategory, enumName: 'IndexerCategory' })
  @IsEnum(IndexerCategory)
  category: IndexerCategory;

  @ApiProperty({ 
    description: 'Database connection ID to use for indexing', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsUUID()
  databaseConnectionId: string;

  @ApiProperty({ description: 'Configuration for the indexer', type: ConfigurationDto })
  @IsObject()
  @Type(() => ConfigurationDto)
  configuration: ConfigurationDto;

  @ApiProperty({ 
    description: 'Optional custom schema configuration', 
    required: false, 
    type: CustomSchemaDto 
  })
  @IsObject()
  @IsOptional()
  @Type(() => CustomSchemaDto)
  customSchema?: CustomSchemaDto;
}