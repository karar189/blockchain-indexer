import { Injectable, Logger } from '@nestjs/common';
import { IndexerCategory } from './entities/indexer.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DataTransformerService {
  private readonly logger = new Logger(DataTransformerService.name);

  transformWebhookData(webhookData: any, indexerCategory: IndexerCategory, configuration: any): any[] {
    try {
      switch (indexerCategory) {
        case IndexerCategory.NFT_BIDS:
          return this.transformNftBids(webhookData, configuration);
        
        case IndexerCategory.NFT_PRICES:
          return this.transformNftPrices(webhookData, configuration);
        
        case IndexerCategory.TOKEN_LOANS:
          return this.transformTokenLoans(webhookData, configuration);
        
        case IndexerCategory.TOKEN_PRICES:
          return this.transformTokenPrices(webhookData, configuration);
        
        case IndexerCategory.CUSTOM:
          return this.transformCustom(webhookData, configuration);
        
        default:
          this.logger.warn(`Unsupported indexer category: ${indexerCategory}`);
          return [];
      }
    } catch (error) {
      this.logger.error(`Error transforming webhook data: ${error.message}`);
      return [];
    }
  }

  private transformNftBids(webhookData: any, configuration: any): any[] {
    const relevantEvents = webhookData.filter(event => {
      if (event.type !== 'NFT_BID') return false;
      if (configuration.collections && configuration.collections.length > 0) {
        const nftAddress = event.events?.nft?.mint;
        return configuration.collections.includes(nftAddress);
      }
      
      return true;
    });
    
    return relevantEvents.map(event => {
      return {
        id: uuidv4(),
        transaction_signature: event.signature,
        block_time: new Date(event.timestamp * 1000),
        nft_address: event.events?.nft?.mint,
        bidder_address: event.events?.bid?.bidder,
        bid_amount: event.events?.bid?.amount,
        marketplace: event.events?.bid?.marketplace || 'unknown',
        currency: event.events?.bid?.currency || 'SOL',
        expiry_time: event.events?.bid?.expiry ? new Date(event.events.bid.expiry * 1000) : null,
        created_at: new Date(),
      };
    });
  }

  private transformNftPrices(webhookData: any, configuration: any): any[] {
    const relevantEvents = webhookData.filter(event => {
      if (event.type !== 'NFT_SALE') return false;
      if (configuration.collections && configuration.collections.length > 0) {
        const nftAddress = event.events?.nft?.mint;
        return configuration.collections.includes(nftAddress);
      }
      
      return true;
    });
    
    return relevantEvents.map(event => {
      return {
        id: uuidv4(),
        transaction_signature: event.signature,
        block_time: new Date(event.timestamp * 1000),
        nft_address: event.events?.nft?.mint,
        collection_address: event.events?.nft?.collection || null,
        sale_amount: event.events?.sale?.amount,
        currency: event.events?.sale?.currency || 'SOL',
        marketplace: event.events?.sale?.marketplace || 'unknown',
        seller_address: event.events?.sale?.seller,
        buyer_address: event.events?.sale?.buyer,
        created_at: new Date(),
      };
    });
  }

  private transformTokenLoans(webhookData: any, configuration: any): any[] {
    const relevantEvents = webhookData.filter(event => {
      if (!event.type.includes('LOAN')) return false;
      
      if (configuration.tokens && configuration.tokens.length > 0) {
        const tokenAddress = event.events?.token?.mint;
        return configuration.tokens.includes(tokenAddress);
      }
      
      if (configuration.platforms && configuration.platforms.length > 0) {
        const platform = event.events?.loan?.platform;
        return configuration.platforms.includes(platform);
      }
      
      return true;
    });
    
    return relevantEvents.map(event => {
      return {
        id: uuidv4(),
        transaction_signature: event.signature,
        block_time: new Date(event.timestamp * 1000),
        token_address: event.events?.token?.mint,
        amount: event.events?.loan?.amount,
        interest_rate: event.events?.loan?.interestRate,
        platform: event.events?.loan?.platform || 'unknown',
        lender_address: event.events?.loan?.lender || null,
        borrower_address: event.events?.loan?.borrower || null,
        duration_seconds: event.events?.loan?.duration || null,
        collateral_token: event.events?.loan?.collateralToken || null,
        collateral_amount: event.events?.loan?.collateralAmount || null,
        created_at: new Date(),
      };
    });
  }

  private transformTokenPrices(webhookData: any, configuration: any): any[] {
    const relevantEvents = webhookData.filter(event => {
      if (!['SWAP', 'TRADE', 'PRICE_UPDATE'].includes(event.type)) return false;
      if (configuration.tokens && configuration.tokens.length > 0) {
        const tokenAddress = event.events?.token?.mint || 
                            event.events?.swap?.inputMint || 
                            event.events?.swap?.outputMint;
        return configuration.tokens.includes(tokenAddress);
      }
      
      if (configuration.platforms && configuration.platforms.length > 0) {
        const platform = event.events?.swap?.platform || event.events?.trade?.platform;
        return configuration.platforms.includes(platform);
      }
      
      return true;
    });

    return relevantEvents.map(event => {
      const tokenInfo = event.events?.token || {};
      const swapInfo = event.events?.swap || {};
      const tradeInfo = event.events?.trade || {};
      const tokenAddress = tokenInfo.mint || swapInfo.inputMint || swapInfo.outputMint;
      const priceInfo = tokenInfo.price || swapInfo.price || tradeInfo.price || {};
      
      return {
        id: uuidv4(),
        transaction_signature: event.signature,
        block_time: new Date(event.timestamp * 1000),
        token_address: tokenAddress,
        price_usd: priceInfo.usd || null,
        platform: swapInfo.platform || tradeInfo.platform || 'unknown',
        volume_24h: tokenInfo.volume24h || null,
        liquidity: tokenInfo.liquidity || null,
        created_at: new Date(),
      };
    });
  }

  private transformCustom(webhookData: any, configuration: any): any[] {
    const { filterField, filterValues, mappings } = configuration.customFilters || {};
    const relevantEvents = webhookData.filter(event => {
      if (!filterField || !filterValues) return true;
      const fieldValue = filterField.split('.').reduce((obj, field) => obj?.[field], event);
      return filterValues.includes(fieldValue);
    });

    return relevantEvents.map(event => {
      const result: any = {
        id: uuidv4(),
        transaction_signature: event.signature,
        block_time: new Date(event.timestamp * 1000),
        created_at: new Date(),
      };
      

if (mappings && typeof mappings === 'object') {
    for (const [targetField, sourcePath] of Object.entries(mappings)) {
      if (typeof sourcePath === 'string') {
        const value = sourcePath.split('.').reduce((obj, field) => obj?.[field], event);
        result[targetField] = value;
      }
    }
  }
      
      return result;
    });
  }
}