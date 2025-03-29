import { Controller, Post, Body, Headers, Logger, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IndexerService } from '../indexer/indexer.service';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly indexerService: IndexerService) {}

  @ApiOperation({ summary: 'Receive webhook events from Helius' })
  @ApiResponse({ status: 200, description: 'Webhook event received and processed' })
  @Post()
  @HttpCode(200)
  async receiveWebhook(@Body() webhookData: any, @Headers() headers: any) {
    try {
      this.logger.debug(`Received webhook event: ${JSON.stringify(webhookData).substring(0, 200)}...`);
      await this.indexerService.processWebhookEvent(webhookData);
      
      return { success: true, message: 'Webhook received and processed' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      return { success: false, message: 'Error processing webhook event' };
    }
  }
}