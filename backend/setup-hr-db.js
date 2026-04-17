const { Client } = require('pg');

async function setup() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    await client.connect();
    console.log('Connected to Postgres');
    
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'hr_db'");
    
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE hr_db');
      console.log('✅ Database hr_db created successfully');
    } else {
      console.log('ℹ️ Database hr_db already exists');
    }
  } catch (err) {
    console.error('❌ Error setting up HR database:', err.message);
    if (err.message.includes('authentication failed')) {
      console.log('Tip: Check your DB_USERNAME and DB_PASSWORD');
    }
  } finally {
    await client.end();
  }
}

setup();
