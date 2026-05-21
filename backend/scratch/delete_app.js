const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/project_db' });
pool.query('DELETE FROM projects WHERE name = $1 RETURNING id', ['App Corale'])
  .then(res => { console.log('Deleted rows:', res.rowCount); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
