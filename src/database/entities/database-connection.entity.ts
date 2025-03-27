import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('database_connections')
export class DatabaseConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column()
  database: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  sslEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  sslConfig: Record<string, any>;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}