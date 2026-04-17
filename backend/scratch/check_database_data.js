const { Client } = require('pg');

async function checkDatabaseData() {
  const dbs = ['auth_db', 'project_db', 'postgres', 'hr_db'];
  const results = {};

  for (const db of dbs) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: db,
      password: 'postgres',
      port: 5432,
    });

    try {
      await client.connect();
      const tablesRes = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
      );
      
      const tables = tablesRes.rows.map(r => r.table_name);
      results[db] = { tables: [], rowCounts: {} };

      for (const table of tables) {
        results[db].tables.push(table);
        try {
          const countRes = await client.query(`SELECT count(*) FROM "${table}"`);
          results[db].rowCounts[table] = countRes.rows[0].count;
        } catch (e) {
          results[db].rowCounts[table] = 'Error: ' + e.message;
        }
      }
    } catch (err) {
      results[db] = { error: err.message };
    } finally {
      await client.end();
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

checkDatabaseData();
