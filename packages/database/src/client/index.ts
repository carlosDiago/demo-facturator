import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";

const defaultConnectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/demo_facturator";

export function createDatabaseClient(connectionString = defaultConnectionString) {
  const sql = postgres(connectionString, {
    max: 1,
  });

  return drizzle(sql, { schema });
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
