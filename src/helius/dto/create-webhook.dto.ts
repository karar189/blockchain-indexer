import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty({ description: 'URL to receive webhook events', example: 'https://your-app.com/webhook' })
  @IsString()
  @IsNotEmpty()
  webhookURL: string;

  @ApiProperty({ 
    description: 'Solana account addresses to monitor', 
    example: ['ABC123...', 'DEF456...'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  accountAddresses: string[];

  @ApiProperty({ 
    description: 'Types of transactions to monitor', 
    example: ['NFT_SALE', 'NFT_LISTING', 'TOKEN_TRANSFER'],
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  transactionTypes?: string[];

  @ApiProperty({ 
    description: 'Solana network', 
    enum: ['mainnet', 'devnet'],
    default: 'mainnet' 
  })
  @IsEnum(['mainnet', 'devnet'])
  @IsOptional()
  network?: string = 'mainnet';
}