const { Client } = require('pg');

async function main() {
  // connectionString should be the DATABASE_URL from .env
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  console.log('Connected to DB');
  await client.query('DROP TABLE IF EXISTS "Laporan" CASCADE');
  console.log('Dropped Laporan table.');
  await client.end();
}

main().catch(console.error);
