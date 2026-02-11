import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load from env/.env.test
dotenv.config({ path: path.resolve(__dirname, '../env/.env.test') });

async function createTestDb() {
  console.log('Connecting to Postgres with:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    db: 'postgres',
  });

  const client = new Client({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: 'postgres', // Connect to default DB
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME;
    console.log(`Checking database: ${dbName}`);

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createTestDb();
