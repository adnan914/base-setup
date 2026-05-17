import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  readonly db: NodePgDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.getOrThrow<string>('DATABASE_URL');
    const databaseSsl = this.configService.get<string>('DATABASE_SSL');
    const useSsl =
      databaseSsl === 'true' ||
      (process.env.NODE_ENV === 'production' && databaseSsl !== 'false');

    this.pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      max: this.configService.get<number>('DATABASE_POOL_MAX') ?? 10,
      idleTimeoutMillis:
        this.configService.get<number>('DATABASE_IDLE_TIMEOUT_MS') ?? 30000,
      connectionTimeoutMillis:
        this.configService.get<number>('DATABASE_CONNECTION_TIMEOUT_MS') ?? 5000,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
