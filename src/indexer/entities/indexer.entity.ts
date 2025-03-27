import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DatabaseConnection } from '../../database/entities/database-connection.entity';

@Entity('indexers')
export class Indexer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['NFT_BIDS', 'NFT_PRICES', 'TOKEN_LOANS', 'TOKEN_PRICES', 'CUSTOM'] })
  category: string;

  @Column({ type: 'json' })
  configuration: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  schema: Record<string, any>;

  @Column({ nullable: true })
  webhookId: string;

  @Column({ default: 'INACTIVE' })
  status: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => DatabaseConnection)
  databaseConnection: DatabaseConnection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}