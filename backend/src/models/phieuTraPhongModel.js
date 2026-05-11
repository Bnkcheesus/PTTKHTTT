const { poolPromise, mssql } = require('../config/db');

// Gọi SP LayDSPDCDeTraPhong: Lấy danh sách phiếu đặt cọc để trả phòng
const getContractsForReturn = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            PDC.MaPhieuDatCoc,
            ISNULL(HD.MaHopDong, N'Không có') AS MaHopDong,
            HD.NgayBatDau,
            HD.NgayKetThuc,
            KH.HoTen,
            PHONG.MaPhong
        FROM PHIEUDATCOC PDC
        JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
        LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        LEFT JOIN CHITIETDATCOC CTDC ON CTDC.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        LEFT JOIN GIUONG G ON CTDC.MaGiuong = G.MaGiuong
        LEFT JOIN PHONG ON PHONG.MaPhong = G.MaPhong
        WHERE PDC.TrangThai <> N'Đã trả phòng'
          AND NOT EXISTS (
              SELECT 1 FROM PHIEUTRAPHONG PTR
              WHERE PTR.MaPhieuDatCoc = PDC.MaPhieuDatCoc
          )
    `);
    return result.recordset;
};

// Lấy chi tiết hợp đồng theo Mã phiếu đặt cọc
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

// Gọi SP TaoPhieuTraPhong: Tạo phiếu trả phòng mới
const createReturnVoucher = async ({ MaPhieuDatCoc, NgayTraPhong, MaNV }) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        // 1. Xử lý chuỗi ngày "sạch" theo định dạng YYYY-MM-DD
        let ngayTraSach = NgayTraPhong instanceof Date
            ? NgayTraPhong.toISOString().slice(0, 10)
            : NgayTraPhong;
        if (ngayTraSach && typeof ngayTraSach === 'string') {
            ngayTraSach = ngayTraSach.trim();
            if (ngayTraSach.includes('/')) {
                const [day, month, year] = ngayTraSach.split('/');
                ngayTraSach = `${year}-${month}-${day}`;
            } else if (ngayTraSach.includes('T')) {
                ngayTraSach = ngayTraSach.split('T')[0];
            }
        }

        await transaction.begin();

        const validateResult = await transaction.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .input('MaNV', mssql.VarChar(50), MaNV)
            .query(`
                SELECT
                    PDC.MaPhieuDatCoc,
                    PDC.MaPhong,
                    HD.NgayKetThuc
                FROM PHIEUDATCOC PDC
                LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
                WHERE PDC.MaPhieuDatCoc = @MaPhieuDatCoc;

                SELECT COUNT(*) AS Count
                FROM NV_KDOANH
                WHERE MaNV = @MaNV;

                SELECT COUNT(*) AS Count
                FROM PHIEUTRAPHONG
                WHERE MaPhieuDatCoc = @MaPhieuDatCoc;
            `);

        const deposit = validateResult.recordsets[0][0];
        const isSalesEmployee = validateResult.recordsets[1][0].Count > 0;
        const hasReturnVoucher = validateResult.recordsets[2][0].Count > 0;

        if (!deposit) {
            throw new Error('Phiếu đặt cọc không tồn tại.');
        }
        if (!isSalesEmployee) {
            throw new Error('Nhân viên không thuộc bộ phận kinh doanh.');
        }
        if (hasReturnVoucher) {
            throw new Error('Phiếu đặt cọc này đã có phiếu trả phòng.');
        }

        const nextIdResult = await transaction.request().query(`
            SELECT ISNULL(MAX(CAST(SUBSTRING(MaPhieuTra, 4, 10) AS INT)), 0) + 1 AS NextNum
            FROM PHIEUTRAPHONG
        `);
        const maPhieuTra = `PTP${String(nextIdResult.recordset[0].NextNum).padStart(3, '0')}`;

        let tinhTrangHD = 'Thanh lý đúng hạn';
        const ngayKetThuc = deposit.NgayKetThuc ? new Date(deposit.NgayKetThuc) : null;
        const ngayTra = new Date(ngayTraSach);
        if (ngayKetThuc && ngayTra < ngayKetThuc) {
            tinhTrangHD = 'Trước hạn';
        } else if (ngayKetThuc && ngayTra > ngayKetThuc) {
            tinhTrangHD = 'Trễ hạn';
        }

        await transaction.request()
            .input('MaPhieuTra', mssql.VarChar(50), maPhieuTra)
            .input('NgayTraPhong', mssql.VarChar(20), ngayTraSach)
            .input('TinhTrangHD', mssql.NVarChar(100), tinhTrangHD)
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .input('MaNV', mssql.VarChar(50), MaNV)
            .query(`
                INSERT INTO PHIEUTRAPHONG (MaPhieuTra, NgayTraPhong, TinhTrangHD, MaPhieuDatCoc, MaNV)
                VALUES (@MaPhieuTra, CONVERT(DATE, @NgayTraPhong, 23), @TinhTrangHD, @MaPhieuDatCoc, @MaNV)
            `);

        await transaction.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .query(`
                UPDATE PHIEUDATCOC
                SET TrangThai = N'Đã trả phòng'
                WHERE MaPhieuDatCoc = @MaPhieuDatCoc
            `);

        if (deposit.MaPhong) {
            await transaction.request()
                .input('MaPhong', mssql.VarChar(50), deposit.MaPhong)
                .query(`
                    UPDATE PHONG
                    SET TrangThai = N'Trống'
                    WHERE MaPhong = @MaPhong
                `);
        }

        await transaction.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .query(`
                UPDATE G
                SET G.TrangThai = N'Trống'
                FROM GIUONG G
                JOIN CHITIETDATCOC CT ON CT.MaGiuong = G.MaGiuong
                WHERE CT.MaPhieuDatCoc = @MaPhieuDatCoc
            `);

        await transaction.commit();

        return { 
            success: true, 
            MaPhieuTra: maPhieuTra
        };
    } catch (err) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback failed in createReturnVoucher:', rollbackError.message);
        }
        console.error('SQL Error in createReturnVoucher:', err.message);
        throw new Error(err.message); 
    }
};

// Lấy chi tiết phiếu trả phòng
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

// Lấy tất cả phiếu trả phòng
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

// Hoàn cọc khi khách từ chối ký hợp đồng
const hoanCocTuChoi = async ({ MaPhieuDatCoc, NgayTraPhong, MaNV }) => {
    const pool = await poolPromise;
    try {
        // 1. Xử lý chuỗi ngày "sạch" theo định dạng YYYY-MM-DD
        let ngayTraSach = NgayTraPhong instanceof Date
            ? NgayTraPhong.toISOString().slice(0, 10)
            : NgayTraPhong;
        if (ngayTraSach && typeof ngayTraSach === 'string') {
            ngayTraSach = ngayTraSach.trim();
            if (ngayTraSach.includes('/')) {
                const [day, month, year] = ngayTraSach.split('/');
                ngayTraSach = `${year}-${month}-${day}`;
            } else if (ngayTraSach.includes('T')) {
                ngayTraSach = ngayTraSach.split('T')[0];
            }
        }

        // 2. Gọi SP HoanCocTuChoi
        const result = await pool.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), MaPhieuDatCoc)
            .input('NgayTraPhong', mssql.VarChar(20), ngayTraSach)
            .input('MaNV', mssql.VarChar(50), MaNV)
            .query(`
                EXEC HoanCocTuChoi
                    @MaPhieuDatCoc = @MaPhieuDatCoc,
                    @NgayTraPhong = @NgayTraPhong,
                    @MaNV = @MaNV
            `);

        // 3. Trả ID vừa tạo về cho Controller
        return { 
            success: true, 
            MaPhieuTra: result.recordset[0].MaPhieuTra 
        };
    } catch (err) {
        console.error('SQL Error in hoanCocTuChoi:', err.message);
        throw new Error(err.message); 
    }
};

// Xóa phiếu trả phòng
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
    hoanCocTuChoi,
    getReturnVoucherDetail,
    getAllReturnVouchers,
    deleteReturnVoucher
};
