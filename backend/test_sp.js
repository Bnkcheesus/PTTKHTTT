const { poolPromise } = require('./src/config/db');

async function recreateSP() {
    try {
        const pool = await poolPromise;
        console.log('Recreating stored procedure LayDSPDCDeTraPhong...');

        const createSP = `
        CREATE OR ALTER PROCEDURE LayDSPDCDeTraPhong
        AS
        BEGIN
            SELECT
                PDC.MaPhieuDatCoc,
                ISNULL(HD.MaHopDong, N'Không có') AS MaHopDong,
                HD.NgayBatDau,
                HD.NgayKetThuc,
                KH.HoTen,
                PDC.MaPhong
            FROM PHIEUDATCOC PDC
            JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
            LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
            WHERE PDC.TrangThai <> N'Đã trả phòng'
              AND PDC.MaPhieuDatCoc NOT IN (
                  SELECT MaPhieuDatCoc FROM PHIEUTRAPHONG
              )
        END;
        `;

        await pool.request().query(createSP);
        console.log('Stored procedure created successfully!');

        // Test execution
        console.log('Testing stored procedure...');
        const result = await pool.request().execute('LayDSPDCDeTraPhong');
        console.log('SP executed successfully!');
        console.log(`Returned ${result.recordset.length} rows`);
        if (result.recordset.length > 0) {
            console.log('First row:', result.recordset[0]);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

recreateSP();