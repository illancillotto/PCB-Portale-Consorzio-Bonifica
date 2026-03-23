import { Pool } from 'pg';

export function createConnectorPool() {
  return new Pool({
    host: process.env.PCB_POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.PCB_POSTGRES_PORT ?? 5432),
    database: process.env.PCB_POSTGRES_DB ?? 'pcb',
    user: process.env.PCB_POSTGRES_USER ?? 'pcb',
    password: process.env.PCB_POSTGRES_PASSWORD ?? 'pcb',
  });
}
