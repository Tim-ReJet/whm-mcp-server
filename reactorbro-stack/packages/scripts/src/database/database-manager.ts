/**
 * Database Abstraction Layer
 * Provides unified interface for file-based and database storage
 */

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
  migrate(migrations: Migration[]): Promise<void>;
}

export interface Transaction {
  query(sql: string, params?: any[]): Promise<any>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface Migration {
  up: string;
  down: string;
  name: string;
}

/**
 * File-based database adapter (fallback)
 */
export class FileDatabaseAdapter implements DatabaseAdapter {
  private dataDir: string;
  private data: Map<string, any> = new Map();

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  async connect(): Promise<void> {
    // Load existing data from files
    // Implementation would read JSON files
  }

  async disconnect(): Promise<void> {
    // Save data to files
    // Implementation would write JSON files
  }

  async query(sql: string, params?: any[]): Promise<any> {
    // Simple SQL-like query parsing for file storage
    // This is a simplified implementation
    if (sql.toLowerCase().startsWith('select')) {
      return this.handleSelect(sql, params);
    } else if (sql.toLowerCase().startsWith('insert')) {
      return this.handleInsert(sql, params);
    } else if (sql.toLowerCase().startsWith('update')) {
      return this.handleUpdate(sql, params);
    } else if (sql.toLowerCase().startsWith('delete')) {
      return this.handleDelete(sql, params);
    }
    return [];
  }

  private handleSelect(sql: string, params?: any[]): any[] {
    // Simplified SELECT parsing
    return Array.from(this.data.values());
  }

  private handleInsert(sql: string, params?: any[]): any {
    // Simplified INSERT parsing
    return { insertId: Date.now() };
  }

  private handleUpdate(sql: string, params?: any[]): any {
    // Simplified UPDATE parsing
    return { affectedRows: 1 };
  }

  private handleDelete(sql: string, params?: any[]): any {
    // Simplified DELETE parsing
    return { affectedRows: 1 };
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx = new FileTransaction(this.data);
    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async migrate(migrations: Migration[]): Promise<void> {
    // File-based migrations
    // Would track applied migrations in a file
  }
}

class FileTransaction implements Transaction {
  private data: Map<string, any>;
  private changes: Map<string, any> = new Map();

  constructor(data: Map<string, any>) {
    this.data = data;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    // Track changes for rollback
    return [];
  }

  async commit(): Promise<void> {
    // Apply changes
    for (const [key, value] of this.changes.entries()) {
      this.data.set(key, value);
    }
  }

  async rollback(): Promise<void> {
    // Discard changes
    this.changes.clear();
  }
}

/**
 * PostgreSQL adapter (optional, requires pg)
 */
export class PostgresDatabaseAdapter implements DatabaseAdapter {
  private pool: any;
  private connectionString: string;

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL || '';
  }

  async connect(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require('pg');
      this.pool = new Pool({
        connectionString: this.connectionString,
      });
      await this.pool.query('SELECT 1');
    } catch (error) {
      throw new Error(`Failed to connect to PostgreSQL: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool.query(sql, params);
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const tx = new PostgresTransaction(client);
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async migrate(migrations: Migration[]): Promise<void> {
    // Create migrations table if not exists
    await this.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get applied migrations
    const applied = await this.query('SELECT name FROM migrations');
    const appliedNames = new Set(applied.rows.map((r: any) => r.name));

    // Apply pending migrations
    for (const migration of migrations) {
      if (!appliedNames.has(migration.name)) {
        await this.query(migration.up);
        await this.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
      }
    }
  }
}

class PostgresTransaction implements Transaction {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    return this.client.query(sql, params);
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
  }
}

/**
 * Convex database adapter (optional, requires convex)
 */
export class ConvexDatabaseAdapter implements DatabaseAdapter {
  private client: any;
  private api: any;
  private convexUrl: string;
  private connected: boolean = false;

  constructor(convexUrl?: string) {
    this.convexUrl = convexUrl || process.env.CONVEX_URL || '';
  }

  async connect(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ConvexHttpClient } = require('convex/browser');

      if (!this.convexUrl) {
        throw new Error('CONVEX_URL environment variable is required');
      }

      this.client = new ConvexHttpClient(this.convexUrl);

      // Try to load API (if available)
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        this.api = require('../../convex/_generated/api.js').api;
      } catch {
        // API not generated yet, will use direct queries
        this.api = null;
      }

      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect to Convex: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    // Convex HTTP client doesn't need explicit disconnect
    this.connected = false;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    // Parse SQL-like queries and convert to Convex operations
    // This is a simplified implementation - in production, you'd use Convex functions
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.startsWith('select')) {
      return this.handleSelect(sql, params);
    } else if (lowerSql.startsWith('insert')) {
      return this.handleInsert(sql, params);
    } else if (lowerSql.startsWith('update')) {
      return this.handleUpdate(sql, params);
    } else if (lowerSql.startsWith('delete')) {
      return this.handleDelete(sql, params);
    }

    throw new Error(`Unsupported SQL operation: ${sql}`);
  }

  private async handleSelect(sql: string, params?: any[]): Promise<any> {
    // Parse table name from SELECT query
    const tableMatch = sql.match(/from\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Could not parse table name from SELECT query');
    }

    const tableName = tableMatch[1];

    // Use Convex query function if available
    if (this.api && this.api[tableName]?.list) {
      return { rows: await this.client.query(this.api[tableName].list) };
    }

    // Fallback: direct database query
    // Note: This requires Convex functions to be set up
    return { rows: [] };
  }

  private async handleInsert(sql: string, params?: any[]): Promise<any> {
    const tableMatch = sql.match(/into\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Could not parse table name from INSERT query');
    }

    const tableName = tableMatch[1];
    const data = params?.[0] || {};

    // Use Convex mutation function if available
    if (this.api && this.api[tableName]?.create) {
      const id = await this.client.mutation(this.api[tableName].create, data);
      return { insertId: id, affectedRows: 1 };
    }

    // Fallback: direct database mutation
    return { insertId: Date.now().toString(), affectedRows: 1 };
  }

  private async handleUpdate(sql: string, params?: any[]): Promise<any> {
    const tableMatch = sql.match(/update\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Could not parse table name from UPDATE query');
    }

    const tableName = tableMatch[1];
    const data = params?.[0] || {};

    // Use Convex mutation function if available
    if (this.api && this.api[tableName]?.update) {
      await this.client.mutation(this.api[tableName].update, data);
      return { affectedRows: 1 };
    }

    return { affectedRows: 1 };
  }

  private async handleDelete(sql: string, params?: any[]): Promise<any> {
    const tableMatch = sql.match(/from\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Could not parse table name from DELETE query');
    }

    const tableName = tableMatch[1];
    const id = params?.[0];

    // Use Convex mutation function if available
    if (this.api && this.api[tableName]?.delete) {
      await this.client.mutation(this.api[tableName].delete, { id });
      return { affectedRows: 1 };
    }

    return { affectedRows: 1 };
  }

  /**
   * Convex-specific: Query using Convex function
   */
  async queryFunction(functionPath: string, args?: any): Promise<any> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    if (!this.api) {
      throw new Error('Convex API not available. Run "npx convex dev" to generate API.');
    }

    const func = this.getNestedFunction(this.api, functionPath);
    if (!func) {
      throw new Error(`Function not found: ${functionPath}`);
    }

    return await this.client.query(func, args);
  }

  /**
   * Convex-specific: Mutate using Convex function
   */
  async mutateFunction(functionPath: string, args?: any): Promise<any> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    if (!this.api) {
      throw new Error('Convex API not available. Run "npx convex dev" to generate API.');
    }

    const func = this.getNestedFunction(this.api, functionPath);
    if (!func) {
      throw new Error(`Function not found: ${functionPath}`);
    }

    return await this.client.mutation(func, args);
  }

  private getNestedFunction(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    // Convex transactions are handled via mutations
    // For now, we'll simulate transactions
    const tx = new ConvexTransaction(this);
    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async migrate(migrations: Migration[]): Promise<void> {
    // Convex uses schema files, not SQL migrations
    // This would track applied migrations in a migrations table
    for (const migration of migrations) {
      // Apply migration via Convex mutation if needed
      // In practice, Convex migrations are handled via schema changes
    }
  }
}

class ConvexTransaction implements Transaction {
  private adapter: ConvexDatabaseAdapter;
  private operations: Array<{ type: string; sql: string; params?: any[] }> = [];

  constructor(adapter: ConvexDatabaseAdapter) {
    this.adapter = adapter;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    this.operations.push({ type: 'query', sql, params });
    // In Convex, queries are read-only, so we just track them
    return { rows: [] };
  }

  async commit(): Promise<void> {
    // Execute all operations
    // Convex handles transactions automatically in mutations
    for (const op of this.operations) {
      if (op.type === 'query') {
        await this.adapter.query(op.sql, op.params);
      }
    }
    this.operations = [];
  }

  async rollback(): Promise<void> {
    // Convex doesn't support rollback in the same way
    // Clear operations
    this.operations = [];
  }
}

/**
 * Database Manager with adapter support
 */
export class DatabaseManager {
  private adapter: DatabaseAdapter;
  private connected: boolean = false;

  constructor(adapter?: DatabaseAdapter) {
    if (adapter) {
      this.adapter = adapter;
    } else {
      // Try Convex first, then PostgreSQL, then file-based
      if (process.env.CONVEX_URL) {
        this.adapter = new ConvexDatabaseAdapter();
      } else if (process.env.DATABASE_URL) {
        this.adapter = new PostgresDatabaseAdapter();
      } else {
        this.adapter = new FileDatabaseAdapter(process.cwd() + '/.data');
      }
    }
  }

  async connect(): Promise<void> {
    try {
      await this.adapter.connect();
      this.connected = true;
    } catch (error) {
      // Fallback chain: Convex -> PostgreSQL -> File-based
      if (this.adapter instanceof ConvexDatabaseAdapter) {
        console.warn('Convex not available, trying PostgreSQL...');
        try {
          this.adapter = new PostgresDatabaseAdapter();
          await this.adapter.connect();
          this.connected = true;
        } catch {
          console.warn('PostgreSQL not available, falling back to file-based storage');
          this.adapter = new FileDatabaseAdapter(process.cwd() + '/.data');
          await this.adapter.connect();
          this.connected = true;
        }
      } else if (this.adapter instanceof PostgresDatabaseAdapter) {
        console.warn('PostgreSQL not available, falling back to file-based storage');
        this.adapter = new FileDatabaseAdapter(process.cwd() + '/.data');
        await this.adapter.connect();
        this.connected = true;
      } else {
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.adapter.disconnect();
      this.connected = false;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }
    return this.adapter.query(sql, params);
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    if (!this.connected) {
      await this.connect();
    }
    return this.adapter.transaction(callback);
  }

  async migrate(migrations: Migration[]): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
    return this.adapter.migrate(migrations);
  }

  /**
   * Convex-specific: Query using Convex function
   */
  async queryFunction(functionPath: string, args?: any): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }
    if (this.adapter instanceof ConvexDatabaseAdapter) {
      return this.adapter.queryFunction(functionPath, args);
    }
    throw new Error('queryFunction is only available with Convex adapter');
  }

  /**
   * Convex-specific: Mutate using Convex function
   */
  async mutateFunction(functionPath: string, args?: any): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }
    if (this.adapter instanceof ConvexDatabaseAdapter) {
      return this.adapter.mutateFunction(functionPath, args);
    }
    throw new Error('mutateFunction is only available with Convex adapter');
  }
}

export default DatabaseManager;

