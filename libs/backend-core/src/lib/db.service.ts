import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://ali:ali@127.0.0.1:5432/superapp',
    max: Number(process.env.DB_POOL_SIZE || 10),
    idleTimeoutMillis: 30_000,
  });

  async onModuleInit() {
    let last: unknown;
    for (let attempt = 1; attempt <= 30; attempt++) {
      try {
        await this.pool.query('select 1');
        await this.migrate();
        this.logger.log('PostgreSQL ready');
        return;
      } catch (error) {
        last = error;
        await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * attempt, 5000)));
      }
    }
    throw last;
  }

  async onModuleDestroy() { await this.pool.end(); }

  private async migrate() {
    await this.pool.query(`
      create table if not exists app_records (
        id uuid primary key,
        service text not null,
        app_slug text not null,
        user_id text not null,
        data jsonb not null default '{}'::jsonb,
        is_public boolean not null default false,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index if not exists idx_app_records_owner on app_records(service, app_slug, user_id, created_at desc);
      create index if not exists idx_app_records_public on app_records(service, app_slug, is_public, created_at desc);
      create table if not exists app_users (
        id uuid primary key,
        email text unique not null,
        display_name text not null,
        password_salt text not null,
        password_hash text not null,
        created_at timestamptz not null default now()
      );
      create table if not exists file_objects (
        id uuid primary key,
        user_id text not null,
        app_slug text not null,
        original_name text not null,
        stored_name text not null,
        mime_type text not null,
        size_bytes bigint not null,
        unlock_at timestamptz,
        created_at timestamptz not null default now()
      );
    `);
  }

  async list(service: string, appSlug: string, userId: string, publicOnly = false) {
    const values = publicOnly ? [service, appSlug] : [service, appSlug, userId];
    const where = publicOnly ? 'service=$1 and app_slug=$2 and is_public=true' : 'service=$1 and app_slug=$2 and user_id=$3';
    const { rows } = await this.pool.query(`select id,data,is_public as "isPublic",created_at as "createdAt",updated_at as "updatedAt" from app_records where ${where} order by created_at desc limit 500`, values);
    return rows;
  }

  async create(service: string, appSlug: string, userId: string, data: Record<string, unknown>, isPublic = false) {
    const id = randomUUID();
    const { rows } = await this.pool.query(
      `insert into app_records(id,service,app_slug,user_id,data,is_public) values($1,$2,$3,$4,$5::jsonb,$6)
       returning id,data,is_public as "isPublic",created_at as "createdAt",updated_at as "updatedAt"`,
      [id, service, appSlug, userId, JSON.stringify(data), isPublic],
    );
    return rows[0];
  }

  async update(service: string, appSlug: string, userId: string, id: string, data: Record<string, unknown>, isPublic?: boolean) {
    const { rows } = await this.pool.query(
      `update app_records set data=$1::jsonb, is_public=coalesce($2,is_public), updated_at=now()
       where id=$3 and service=$4 and app_slug=$5 and user_id=$6
       returning id,data,is_public as "isPublic",created_at as "createdAt",updated_at as "updatedAt"`,
      [JSON.stringify(data), isPublic ?? null, id, service, appSlug, userId],
    );
    return rows[0] ?? null;
  }

  async remove(service: string, appSlug: string, userId: string, id: string) {
    const result = await this.pool.query('delete from app_records where id=$1 and service=$2 and app_slug=$3 and user_id=$4', [id, service, appSlug, userId]);
    return { deleted: result.rowCount === 1 };
  }

  async query<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
    const { rows } = await this.pool.query(sql, params);
    return rows as T[];
  }
}
