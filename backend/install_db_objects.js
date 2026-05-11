const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./src/config/db');

(async () => {
  try {
    const sqlPath = path.resolve(__dirname, '../database/7_sp_HopDong.sql');
    const sqlText = fs.readFileSync(sqlPath, 'utf8');
    const statements = sqlText
      .split(/^(?:GO|go)\s*$/gim)
      .map((stmt) => stmt.trim())
      .filter(Boolean);

    const pool = await poolPromise;
    console.log(`Executing ${statements.length} SQL statement(s) from ${sqlPath}`);

    const ensureColumns = [
      { name: 'TienThueNo', definition: 'DECIMAL(18,2) NULL' },
      { name: 'TienPhat', definition: 'DECIMAL(18,2) NULL' },
    ];

    for (const column of ensureColumns) {
      const exists = await pool.request()
        .input('columnName', column.name)
        .query(`
          SELECT 1
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'PHIEUKIEMTRA'
            AND COLUMN_NAME = @columnName
        `);

      if (exists.recordset.length === 0) {
        console.log(`Adding missing column PHIEUKIEMTRA.${column.name}`);
        await pool.request().query(`ALTER TABLE PHIEUKIEMTRA ADD ${column.name} ${column.definition};`);
      }
    }

    for (let i = 0; i < statements.length; i += 1) {
      const sql = statements[i];
      console.log(`-- Running statement ${i + 1}/${statements.length}`);
      await pool.request().query(sql);
    }

    console.log('Database objects installed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to install database objects:', err.message || err);
    process.exit(1);
  }
})();
