const { poolPromise, mssql } = require('../config/db');

// Get list of deposit slips that haven't been returned yet and have no invoice
const getContractsForReturn = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT 
            pdc.MaPhieuDatCoc,
            ISNULL(hd.MaHopDong, N'Không có') AS MaHopDong,
            hd.NgayBatDau,
            hd.NgayKetThuc,
            kh.HoTen,
            kh.SDT,
            p.MaPhong
        FROM PHIEUDATCOC pdc
        JOIN KHACHHANG kh ON pdc.MaKH = kh.MaKH
        JOIN PHONG p ON pdc.MaPhong = p.MaPhong
        LEFT JOIN HOPDONG hd ON hd.MaPhieuDatCoc = pdc.MaPhieuDatCoc
    `);
    return result.recordset;
};

// Get contract details by deposit ID
const getContractDetail = async (MaPhieuDatCoc) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
        .query(`
            SELECT 
                pdc.MaPhieuDatCoc,
                ISNULL(hd.MaHopDong, N'Không có') AS MaHopDong,
                hd.NgayBatDau,
                hd.NgayKetThuc,
                hd.NoiDungHD,
                kh.HoTen,
                kh.SDT,
                kh.Email,
                p.MaPhong,
                p.GiaThuePhong,
                pdc.TienCoc
            FROM PHIEUDATCOC pdc
            JOIN KHACHHANG kh ON pdc.MaKH = kh.MaKH
            JOIN PHONG p ON pdc.MaPhong = p.MaPhong
            LEFT JOIN HOPDONG hd ON hd.MaPhieuDatCoc = pdc.MaPhieuDatCoc
            WHERE pdc.MaPhieuDatCoc = @MaPhieuDatCoc
        `);
    return result.recordset[0];
};

// Create a new return room voucher
const createReturnVoucher = async ({ MaPhieuDatCoc, NgayTraPhong, TinhTrangHD, MaNV }) => {
    const pool = await poolPromise;
    try {
        // Guard: reject if MaPhieuDatCoc already has a PHIEUTRAPHONG row
        const existsCheck = await pool.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .query(`
                SELECT COUNT(*) AS cnt
                FROM PHIEUTRAPHONG
                WHERE MaPhieuDatCoc = @MaPhieuDatCoc
            `);
        if (existsCheck.recordset[0].cnt > 0) {
            throw new Error('Phiếu đặt cọc này đã có phiếu trả phòng.');
        }

        // Guard: reject if MaPhieuDatCoc already has an invoice (via PHIEUTRAPHONG → HOADON)
        const invoiceCheck = await pool.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .query(`
                SELECT COUNT(*) AS cnt
                FROM HOADON hdoa
                JOIN PHIEUTRAPHONG ptr ON hdoa.MaPhieuTra = ptr.MaPhieuTra
                WHERE ptr.MaPhieuDatCoc = @MaPhieuDatCoc
            `);
        if (invoiceCheck.recordset[0].cnt > 0) {
            throw new Error('Phiếu đặt cọc này đã có hóa đơn liên kết.');
        }

        // Generate new ID
        const idResult = await pool.request().query(`
            SELECT 'PTR' + CONVERT(VARCHAR(20), COUNT(*) + 1) as NewId 
            FROM PHIEUTRAPHONG
        `);
        const newId = idResult.recordset[0].NewId;

        // Format date
        const formatToDMY = (dateStr) => {
            if (!dateStr) return new Date().toLocaleDateString('en-GB');
            if (dateStr.includes('-')) {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            }
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB');
        };

        const ngayTra_DMY = formatToDMY(NgayTraPhong);

        // Insert return voucher
        await pool.request()
            .input('MaPhieuTra', mssql.VarChar(50), newId)
            .input('NgayTraPhong', mssql.VarChar(10), ngayTra_DMY)
            .input('TinhTrangHD', mssql.NVarChar(100), TinhTrangHD)
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .input('MaNV', mssql.VarChar(50), MaNV)
            .query(`
                INSERT INTO PHIEUTRAPHONG (MaPhieuTra, NgayTraPhong, TinhTrangHD, MaPhieuDatCoc, MaNV)
                VALUES (@MaPhieuTra, CAST(@NgayTraPhong AS DATE), @TinhTrangHD, @MaPhieuDatCoc, @MaNV)
            `);

        return { success: true, MaPhieuTra: newId };
    } catch (err) {
        console.error('SQL Error:', err);
        throw err;
    }
};

// Get return voucher details
const getReturnVoucherDetail = async (MaPhieuTra) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhieuTra', mssql.VarChar(50), MaPhieuTra)
        .query(`
            SELECT 
                ptr.MaPhieuTra,
                ptr.NgayTraPhong,
                ptr.TinhTrangHD,
                ISNULL(hd.MaHopDong, N'Không có') AS MaHopDong,
                pdc.MaPhieuDatCoc,
                kh.HoTen,
                p.MaPhong,
                nv.TenNV
            FROM PHIEUTRAPHONG ptr
            JOIN PHIEUDATCOC pdc ON ptr.MaPhieuDatCoc = pdc.MaPhieuDatCoc
            LEFT JOIN HOPDONG hd ON hd.MaPhieuDatCoc = pdc.MaPhieuDatCoc
            JOIN KHACHHANG kh ON pdc.MaKH = kh.MaKH
            JOIN PHONG p ON pdc.MaPhong = p.MaPhong
            JOIN NHANVIEN nv ON ptr.MaNV = nv.MaNV
            WHERE ptr.MaPhieuTra = @MaPhieuTra
        `);
    return result.recordset[0];
};

// Get all return vouchers
const getAllReturnVouchers = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT 
            ptr.MaPhieuTra,
            ptr.NgayTraPhong,
            ptr.TinhTrangHD,
            ISNULL(hd.MaHopDong, N'Không có') AS MaHopDong,
            pdc.MaPhieuDatCoc,
            kh.HoTen,
            p.MaPhong,
            nv.TenNV
        FROM PHIEUTRAPHONG ptr
        JOIN PHIEUDATCOC pdc ON ptr.MaPhieuDatCoc = pdc.MaPhieuDatCoc
        LEFT JOIN HOPDONG hd ON hd.MaPhieuDatCoc = pdc.MaPhieuDatCoc
        JOIN KHACHHANG kh ON pdc.MaKH = kh.MaKH
        JOIN PHONG p ON pdc.MaPhong = p.MaPhong
        JOIN NHANVIEN nv ON ptr.MaNV = nv.MaNV
        ORDER BY ptr.NgayTraPhong DESC
    `);
    return result.recordset;
};

// Delete return voucher
const deleteReturnVoucher = async (MaPhieuTra) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPhieuTra', mssql.VarChar(50), MaPhieuTra)
        .query(`DELETE FROM PHIEUTRAPHONG WHERE MaPhieuTra = @MaPhieuTra`);
};

module.exports = {
    getContractsForReturn,
    getContractDetail,
    createReturnVoucher,
    getReturnVoucherDetail,
    getAllReturnVouchers,
    deleteReturnVoucher
};