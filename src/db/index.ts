import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

// Neon HTTP serverless client (ideal for Vercel Serverless Functions)
export const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

export function getDb() {
  if (!db) {
    throw new Error(
      "Database connection is not configured. Please supply DATABASE_URL in environment variables."
    );
  }
  return db;
}
