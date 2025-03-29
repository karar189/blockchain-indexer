import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { IndexerModule } from '../indexer/indexer.module';

@Module({
  imports: [IndexerModule],
  controllers: [WebhookController],
})
export class WebhookModule {}