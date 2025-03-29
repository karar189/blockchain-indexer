
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { DatabaseConnection } from './entities/database-connection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseConnection])],
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}