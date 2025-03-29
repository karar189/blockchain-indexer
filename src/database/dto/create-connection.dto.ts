import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConnectionDto {
  @ApiProperty({ description: 'Name of the database connection', example: 'My Production DB' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Database host', example: 'localhost' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ description: 'Database port', example: 5432 })
  @IsNumber()
  port: number;

  @ApiProperty({ description: 'Database name', example: 'blockchain_data' })
  @IsString()
  @IsNotEmpty()
  database: string;

  @ApiProperty({ description: 'Database username', example: 'postgres' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Database password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'SSL connection enabled', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  sslEnabled?: boolean;

  @ApiProperty({ description: 'Additional SSL configuration', required: false })
  @IsOptional()
  sslConfig?: Record<string, any>;
}