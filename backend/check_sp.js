const { poolPromise } = require('./src/config/db');

(async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT OBJECT_ID('dbo.LayDS_ChoKiemTra') AS ObjId, OBJECTPROPERTY(OBJECT_ID('dbo.LayDS_ChoKiemTra'), 'IsProcedure') AS IsProc");
    console.log(result.recordset);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();