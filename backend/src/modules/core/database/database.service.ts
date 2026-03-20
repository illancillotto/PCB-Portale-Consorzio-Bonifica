import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    host: process.env.PCB_POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.PCB_POSTGRES_PORT ?? 5432),
    database: process.env.PCB_POSTGRES_DB ?? 'pcb',
    user: process.env.PCB_POSTGRES_USER ?? 'pcb',
    password: process.env.PCB_POSTGRES_PASSWORD ?? 'pcb',
  });

  query<T extends QueryResultRow>(text: string, values: unknown[] = []): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, values);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
