import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HeliusService {
  private readonly logger = new Logger(HeliusService.name);
  private readonly apiKey: string;
  private readonly mainnetUrl: string;
  private readonly devnetUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HELIUS_API_KEY');
    this.mainnetUrl = `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
    this.devnetUrl = `https://devnet.helius-rpc.com/?api-key=${this.apiKey}`;
  }

  async registerWebhook(webhookUrl: string, accountAddresses: string[], transactionTypes: string[] = [], network = 'mainnet') {
    try {
      const apiUrl = `https://api.helius.xyz/v0/webhooks?api-key=${this.apiKey}`;
      
      const response = await axios.post(apiUrl, {
        webhookURL: webhookUrl,
        accountAddresses,
        transactionTypes,
        webhookType: 'enhanced',
        network,
      });
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to register webhook: ${error.message}`);
      throw new HttpException(
        `Failed to register webhook: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getWebhooks() {
    try {
      const apiUrl = `https://api.helius.xyz/v0/webhooks?api-key=${this.apiKey}`;
      
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get webhooks: ${error.message}`);
      throw new HttpException(
        `Failed to get webhooks: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getWebhook(webhookId: string) {
    try {
      const apiUrl = `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.apiKey}`;
      
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get webhook: ${error.message}`);
      throw new HttpException(
        `Failed to get webhook: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateWebhook(webhookId: string, accountAddresses: string[], transactionTypes: string[] = []) {
    try {
      const apiUrl = `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.apiKey}`;
      
      const response = await axios.put(apiUrl, {
        accountAddresses,
        transactionTypes,
      });
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update webhook: ${error.message}`);
      throw new HttpException(
        `Failed to update webhook: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async deleteWebhook(webhookId: string) {
    try {
      const apiUrl = `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.apiKey}`;
      
      const response = await axios.delete(apiUrl);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to delete webhook: ${error.message}`);
      throw new HttpException(
        `Failed to delete webhook: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getNftMetadata(mintAddresses: string[]) {
    try {
      const apiUrl = `https://api.helius.xyz/v0/tokens/metadata?api-key=${this.apiKey}`;
      
      const response = await axios.post(apiUrl, {
        mintAccounts: mintAddresses,
      });
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get NFT metadata: ${error.message}`);
      throw new HttpException(
        `Failed to get NFT metadata: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async rpcCall(method: string, params: any[], network = 'mainnet') {
    try {
      const url = network === 'mainnet' ? this.mainnetUrl : this.devnetUrl;
      
      const response = await axios.post(url, {
        jsonrpc: '2.0',
        id: 'helius-indexer',
        method,
        params,
      });
      
      return response.data.result;
    } catch (error) {
      this.logger.error(`RPC call failed: ${error.message}`);
      throw new HttpException(
        `RPC call failed: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}