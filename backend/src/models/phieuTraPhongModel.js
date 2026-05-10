const { poolPromise, mssql } = require('../config/db');

// Gọi SP LayDSPDCDeTraPhong: Lấy danh sách phiếu đặt cọc để trả phòng
const getContractsForReturn = async () => {
    const pool = await poolPromise;
    // Sử dụng SP bạn đã định nghĩa trong 7_sp_HopDong.sql
    const result = await pool.request().execute('LayDSPDCDeTraPhong');
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
const createReturnVoucher = async ({ MaPhieuDatCoc, NgayTraPhong, TinhTrangHD, MaNV }) => {
    const pool = await poolPromise;
    try {
        // 1. Xử lý chuỗi ngày "sạch" theo định dạng YYYY-MM-DD
        let ngayTraSach = NgayTraPhong;
        if (NgayTraPhong && typeof NgayTraPhong === 'string') {
            if (NgayTraPhong.includes('/')) {
                const [day, month, year] = NgayTraPhong.split('/');
                ngayTraSach = `${year}-${month}-${day}`;
            } else if (NgayTraPhong.includes('T')) {
                ngayTraSach = NgayTraPhong.split('T')[0];
            }
        }

        // 2. Xử lý escape dấu nháy đơn (') cho Tình Trạng HĐ để không làm hỏng cú pháp SQL khi nối chuỗi
        const safeTinhTrangHD = TinhTrangHD ? TinhTrangHD.replace(/'/g, "''") : '';

        // 3. NỐI CHUỖI TRỰC TIẾP (RAW QUERY): Bỏ qua hoàn toàn .input()
        // Cách này đưa câu lệnh thuần túy xuống SQL Server giống y hệt lúc bạn gõ trong SSMS
        const queryStr = `
            EXEC TaoPhieuTraPhong 
                @MaPhieuDatCoc = '${MaPhieuDatCoc}', 
                @NgayTraPhong = '${ngayTraSach}', 
                @TinhTrangHD = N'${safeTinhTrangHD}', 
                @MaNV = '${MaNV}'
        `;

        const result = await pool.request().query(queryStr);

        // 4. Trả ID vừa tạo về cho Controller
        return { 
            success: true, 
            MaPhieuTra: result.recordset[0].MaPhieuTra 
        };
    } catch (err) {
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
    getReturnVoucherDetail,
    getAllReturnVouchers,
    deleteReturnVoucher
};