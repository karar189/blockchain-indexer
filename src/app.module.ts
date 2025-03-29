import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HeliusModule } from './helius/helius.module';
import { IndexerModule } from './indexer/indexer.module';
import { WebhookModule } from './webhook/webhook.module';
import { DatabaseModule } from './database/database.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UserModule,
    DatabaseModule,
    HeliusModule,
    IndexerModule,
    WebhookModule,
  ],
})
export class AppModule {}