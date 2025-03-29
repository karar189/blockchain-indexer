import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'pg';
import { DatabaseConnection } from '../database/entities/database-connection.entity';

@Injectable()
export class DatabaseConnectorService {
  private readonly logger = new Logger(DatabaseConnectorService.name);
  private clients: Map<string, Client> = new Map();

  async getClient(connection: DatabaseConnection): Promise<Client> {
    if (this.clients.has(connection.id)) {
      const client = this.clients.get(connection.id);
      try {
        await client.query('SELECT 1');
        return client;
      } catch (error) {
        this.logger.warn(`Client for connection ${connection.id} is disconnected, creating a new one`);
        this.clients.delete(connection.id);
      }
    }
    const client = new Client({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
      ssl: connection.sslEnabled 
        ? connection.sslConfig || { rejectUnauthorized: false }
        : undefined,
    });
    
    try {
      await client.connect();
      this.clients.set(connection.id, client);
      return client;
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }

  async releaseClient(connectionId: string): Promise<void> {
    const client = this.clients.get(connectionId);
    if (client) {
      try {
        await client.end();
      } catch (error) {
        this.logger.error(`Error ending client connection: ${error.message}`);
      }
      this.clients.delete(connectionId);
    }
  }

  async createTable(client: Client, schema: any): Promise<void> {
    try {
      const createTableQuery = this.generateCreateTableQuery(schema);
      await client.query(createTableQuery);
      if (schema.indices && schema.indices.length > 0) {
        for (const index of schema.indices) {
          const createIndexQuery = this.generateCreateIndexQuery(schema.tableName, index);
          await client.query(createIndexQuery);
        }
      }
    } catch (error) {
      throw new Error(`Failed to create table: ${error.message}`);
    }
  }

  async tableExists(client: Client, tableName: string): Promise<boolean> {
    try {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [tableName]);
      
      return result.rows[0].exists;
    } catch (error) {
      throw new Error(`Failed to check if table exists: ${error.message}`);
    }
  }

  async insertData(client: Client, tableName: string, data: any[]): Promise<void> {
    if (data.length === 0) return;
    
    try {
      await client.query('BEGIN');
      
      for (const record of data) {
        const columns = Object.keys(record);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = columns.map(col => record[col]);
        
        const query = `
          INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;
        
        await client.query(query, values);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to insert data: ${error.message}`);
    }
  }

  private generateCreateTableQuery(schema: any): string {
    const columns = schema.fields.map(field => {
      let columnDef = `"${field.name}" ${field.type}`;
      
      if (field.isPrimary) {
        columnDef += ' PRIMARY KEY';
      }
      
      if (field.isNullable === false) {
        columnDef += ' NOT NULL';
      }
      
      return columnDef;
    }).join(',\n  ');
    
    return `
      CREATE TABLE IF NOT EXISTS "${schema.tableName}" (
        ${columns}
      )
    `;
  }

  private generateCreateIndexQuery(tableName: string, index: any): string {
    const uniqueClause = index.isUnique ? 'UNIQUE' : '';
    const columns = index.columns.map(col => `"${col}"`).join(', ');
    
    return `
      CREATE ${uniqueClause} INDEX IF NOT EXISTS "${index.name}"
      ON "${tableName}" (${columns})
    `;
  }
}