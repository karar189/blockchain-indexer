import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('database_connections')
export class DatabaseConnection {
  @ApiProperty({ description: 'Unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the database connection', example: 'My Production DB' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Database host', example: 'localhost' })
  @Column()
  host: string;

  @ApiProperty({ description: 'Database port', example: 5432 })
  @Column()
  port: number;

  @ApiProperty({ description: 'Database name', example: 'blockchain_data' })
  @Column()
  database: string;

  @ApiProperty({ description: 'Database username', example: 'postgres' })
  @Column()
  username: string;

  @ApiProperty({ description: 'Database password (encrypted)' })
  @Column()
  password: string;

  @ApiProperty({ description: 'SSL connection enabled', example: false })
  @Column({ default: false })
  sslEnabled: boolean;

  @ApiProperty({ description: 'Additional SSL configuration' })
  @Column({ type: 'json', nullable: true })
  sslConfig: Record<string, any>;

  @ApiProperty({ description: 'Connection status', example: true })
  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({ description: 'Connection creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Connection last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}