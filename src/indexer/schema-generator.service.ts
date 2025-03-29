import { Injectable, Logger } from '@nestjs/common';
import { IndexerCategory } from './entities/indexer.entity';

@Injectable()
export class SchemaGeneratorService {
  private readonly logger = new Logger(SchemaGeneratorService.name);

  generateSchema(category: IndexerCategory, customSchema?: any, configuration?: any) {
    const tableName = customSchema?.tableName || this.getDefaultTableName(category);
    const fields = customSchema?.fields || this.getDefaultFields(category);
    const indices = customSchema?.indices || this.getDefaultIndices(category);
    
    return {
      tableName,
      fields,
      indices,
    };
  }

  private getDefaultTableName(category: IndexerCategory): string {
    switch (category) {
      case IndexerCategory.NFT_BIDS:
        return 'nft_bids';
      case IndexerCategory.NFT_PRICES:
        return 'nft_prices';
      case IndexerCategory.TOKEN_LOANS:
        return 'token_loans';
      case IndexerCategory.TOKEN_PRICES:
        return 'token_prices';
      case IndexerCategory.CUSTOM:
        return 'custom_data';
      default:
        return 'blockchain_data';
    }
  }

  private getDefaultFields(category: IndexerCategory) {
    const commonFields = [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'transaction_signature', type: 'text' },
      { name: 'block_time', type: 'timestamp' },
      { name: 'created_at', type: 'timestamp' },
    ];
    
    switch (category) {
      case IndexerCategory.NFT_BIDS:
        return [
          ...commonFields,
          { name: 'nft_address', type: 'text' },
          { name: 'bidder_address', type: 'text' },
          { name: 'bid_amount', type: 'numeric' },
          { name: 'marketplace', type: 'text' },
          { name: 'currency', type: 'text' },
          { name: 'expiry_time', type: 'timestamp', isNullable: true },
        ];
      
      case IndexerCategory.NFT_PRICES:
        return [
          ...commonFields,
          { name: 'nft_address', type: 'text' },
          { name: 'collection_address', type: 'text', isNullable: true },
          { name: 'sale_amount', type: 'numeric' },
          { name: 'currency', type: 'text' },
          { name: 'marketplace', type: 'text' },
          { name: 'seller_address', type: 'text' },
          { name: 'buyer_address', type: 'text' },
        ];
      
      case IndexerCategory.TOKEN_LOANS:
        return [
          ...commonFields,
          { name: 'token_address', type: 'text' },
          { name: 'amount', type: 'numeric' },
          { name: 'interest_rate', type: 'numeric' },
          { name: 'platform', type: 'text' },
          { name: 'lender_address', type: 'text', isNullable: true },
          { name: 'borrower_address', type: 'text', isNullable: true },
          { name: 'duration_seconds', type: 'integer', isNullable: true },
          { name: 'collateral_token', type: 'text', isNullable: true },
          { name: 'collateral_amount', type: 'numeric', isNullable: true },
        ];
      
      case IndexerCategory.TOKEN_PRICES:
        return [
          ...commonFields,
          { name: 'token_address', type: 'text' },
          { name: 'price_usd', type: 'numeric' },
          { name: 'platform', type: 'text' },
          { name: 'volume_24h', type: 'numeric', isNullable: true },
          { name: 'liquidity', type: 'numeric', isNullable: true },
        ];
      
      case IndexerCategory.CUSTOM:
      default:
        return commonFields;
    }
  }

  private getDefaultIndices(category: IndexerCategory) {
    const commonIndices = [
      { name: 'transaction_signature_idx', columns: ['transaction_signature'] },
      { name: 'block_time_idx', columns: ['block_time'] },
    ];
    
    switch (category) {
      case IndexerCategory.NFT_BIDS:
        return [
          ...commonIndices,
          { name: 'nft_address_idx', columns: ['nft_address'] },
          { name: 'bidder_address_idx', columns: ['bidder_address'] },
        ];
      
      case IndexerCategory.NFT_PRICES:
        return [
          ...commonIndices,
          { name: 'nft_address_idx', columns: ['nft_address'] },
          { name: 'collection_address_idx', columns: ['collection_address'] },
          { name: 'marketplace_idx', columns: ['marketplace'] },
        ];
      
      case IndexerCategory.TOKEN_LOANS:
        return [
          ...commonIndices,
          { name: 'token_address_idx', columns: ['token_address'] },
          { name: 'platform_idx', columns: ['platform'] },
        ];
      
      case IndexerCategory.TOKEN_PRICES:
        return [
          ...commonIndices,
          { name: 'token_address_idx', columns: ['token_address'] },
          { name: 'platform_idx', columns: ['platform'] },
        ];
      
      case IndexerCategory.CUSTOM:
      default:
        return commonIndices;
    }
  }
}