import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { HeliusService } from './helius.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('helius')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('helius')
export class HeliusController {
  constructor(private readonly heliusService: HeliusService) {}

  @ApiOperation({ summary: 'Register a new Helius webhook' })
  @ApiResponse({ status: 201, description: 'Webhook successfully registered' })
  @Post('webhook')
  registerWebhook(@Body() createWebhookDto: CreateWebhookDto) {
    return this.heliusService.registerWebhook(
      createWebhookDto.webhookURL,
      createWebhookDto.accountAddresses,
      createWebhookDto.transactionTypes,
      createWebhookDto.network
    );
  }

  @ApiOperation({ summary: 'Get all registered webhooks' })
  @ApiResponse({ status: 200, description: 'Return all webhooks' })
  @Get('webhooks')
  getWebhooks() {
    return this.heliusService.getWebhooks();
  }

  @ApiOperation({ summary: 'Get a specific webhook' })
  @ApiResponse({ status: 200, description: 'Return webhook details' })
  @Get('webhook/:id')
  getWebhook(@Param('id') id: string) {
    return this.heliusService.getWebhook(id);
  }

  @ApiOperation({ summary: 'Update a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook successfully updated' })
  @Put('webhook/:id')
  updateWebhook(
    @Param('id') id: string,
    @Body() updateData: { accountAddresses: string[], transactionTypes?: string[] }
  ) {
    return this.heliusService.updateWebhook(
      id,
      updateData.accountAddresses,
      updateData.transactionTypes
    );
  }

  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook successfully deleted' })
  @Delete('webhook/:id')
  deleteWebhook(@Param('id') id: string) {
    return this.heliusService.deleteWebhook(id);
  }

  @ApiOperation({ summary: 'Get NFT metadata' })
  @ApiResponse({ status: 200, description: 'Return NFT metadata' })
  @Post('nft/metadata')
  getNftMetadata(@Body() body: { mintAddresses: string[] }) {
    return this.heliusService.getNftMetadata(body.mintAddresses);
  }
}