import { drizzle } from 'drizzle-orm/postgres-js'
// import { DATABASE_URL } from '$env/static/private';
import * as schema from "./schema"
import { DATABASE_URL } from '$env/static/private';
//if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = drizzle(DATABASE_URL,{schema});
