const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./src/config/db');

(async () => {
  try {
    const sqlPath = path.resolve(__dirname, '..', 'database', '7_sp_HopDong.sql');
    const sqlText = fs.readFileSync(sqlPath, 'utf8');
    const statements = sqlText.split(/^(?:GO|go)\s*$/gim).map((s) => s.trim()).filter(Boolean);
    const pool = await poolPromise;
    console.log('STATEMENTS', statements.length);
    for (const c of [
      { name: 'TienThueNo', definition: 'DECIMAL(18,2) NULL' },
      { name: 'TienPhat', definition: 'DECIMAL(18,2) NULL' },
    ]) {
      const exists = await pool.request()
        .input('columnName', c.name)
        .query("SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PHIEUKIEMTRA' AND COLUMN_NAME = @columnName");
      console.log('CHECK', c.name, exists.recordset.length);
      if (exists.recordset.length === 0) {
        await pool.request().query(`ALTER TABLE PHIEUKIEMTRA ADD ${c.name} ${c.definition}`);
        console.log('ADDED', c.name);
      }
    }
    const cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='PHIEUKIEMTRA'");
    console.log('CURRENT_COLUMNS', cols.recordset.map((r) => r.COLUMN_NAME));
    for (let i = 0; i < statements.length; i += 1) {
      console.log('RUN', i + 1);
      await pool.request().query(statements[i]);
    }
    console.log('DONE');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
