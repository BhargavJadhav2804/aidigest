import { drizzle } from 'drizzle-orm/postgres-js'
import { env } from "$env/dynamic/private"
import * as schema from "./schema"
import postgres from 'postgres'

// Disable prefetch as it is not supported for "Transaction" pool mode 
const client = postgres(env.DATABASE_URL, { prepare: false })
export const db = drizzle({ client, schema });