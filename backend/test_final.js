const { poolPromise, mssql } = require('./src/config/db');

async function testSPs() {
    try {
        const pool = await poolPromise;
        console.log('Testing stored procedures...');

        // Test TaoPhieuTraPhong with parameters
        console.log('Testing TaoPhieuTraPhong...');
        const result1 = await pool.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), 'PDC051')
            .input('NgayTraPhong', mssql.VarChar(20), '2024-12-01')
            .input('TinhTrangHD', mssql.NVarChar(100), N'Bình thường')
            .input('MaNV', mssql.VarChar(50), 'NV001')
            .execute('TaoPhieuTraPhong');
        console.log('✓ TaoPhieuTraPhong executed successfully');

        // Test HoanCocTuChoi with parameters
        console.log('Testing HoanCocTuChoi...');
        const result2 = await pool.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), 'PDC052')
            .input('NgayTraPhong', mssql.VarChar(20), '2024-12-02')
            .input('MaNV', mssql.VarChar(50), 'NV001')
            .execute('HoanCocTuChoi');
        console.log('✓ HoanCocTuChoi executed successfully');

        console.log('All stored procedures are working!');

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testSPs();