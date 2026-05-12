const { poolPromise, mssql } = require('../config/db');

const getPaidDepositsNoContract = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT 
            P.MaPhieuDatCoc, 
            K.HoTen,
            P.NgayLap, 
            CN.MaNhom,
            P.TrangThai,
            P.MaPhong
        FROM PHIEUDATCOC P
        JOIN KHACHHANG K ON K.MaKH = P.MaKH
        LEFT JOIN CHITIET_NHOMTHUE CN ON CN.MaKH = K.MaKH
        WHERE P.TrangThai IN (N'Đã thanh toán', N'Được chấp thuận') AND 
        P.MaPhieuDatCoc NOT IN (SELECT MaPhieuDatCoc FROM HOPDONG WHERE MaPhieuDatCoc IS NOT NULL)
    `);
    return result.recordset;
};

const getApprovedDepositsNoContract = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT 
            P.MaPhieuDatCoc, 
            K.HoTen, 
            P.NgayLap, 
            CN.MaNhom, 
            P.TrangThai,
            P.MaPhong
        FROM PHIEUDATCOC P
        JOIN KHACHHANG K ON K.MaKH = P.MaKH
        LEFT JOIN CHITIET_NHOMTHUE CN ON CN.MaKH = K.MaKH
        WHERE P.TrangThai = N'Được chấp thuận' AND P.MaPhieuDatCoc NOT IN (
            SELECT MaPhieuDatCoc FROM HOPDONG WHERE MaPhieuDatCoc IS NOT NULL
        )
    `);
    return result.recordset;
};

const approveDeposit = async (maPhieu) => {
    const pool = await poolPromise;
    await pool.request()
        .input('maPhieu', mssql.VarChar(50), maPhieu)
        .execute('sp_DuyetDatCoc');
};

const rejectDeposit = async (maPhieu) => {
    const pool = await poolPromise;
    await pool.request()
        .input('maPhieu', mssql.VarChar(50), maPhieu)
        .execute('sp_TuChoiDatCoc');
};

const getContractList = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSHopDong');
    return result.recordset;
};

const createContract = async ({ MaPhieu, NgayBatDau, NgayKetThuc, NoiDungHD, MaNV = null }) => {
    const pool = await poolPromise;
    try {
        // Log để kiểm tra dữ liệu trước khi gửi
        console.log("Dữ liệu gửi vào SQL:", { MaPhieu, NgayBatDau, NgayKetThuc, NoiDungHD, MaNV });

        const result = await pool.request()
            .input('MaPhieu', mssql.VarChar(50), MaPhieu)
            // Thay đổi ở đây: Dùng VarChar hoặc NVarChar cho chuỗi 'YYYY-MM-DD'
            // SQL Server sẽ tự convert sang DATE trong Procedure
            .input('NgayBatDau', mssql.VarChar(10), NgayBatDau)
            .input('NgayKetThuc', mssql.VarChar(10), NgayKetThuc)
            .input('NoiDungHD', mssql.NVarChar(500), NoiDungHD)
            // Đảm bảo MaNV không phải là undefined, nếu không có thì để null
            .input('MaNV', mssql.VarChar(50), MaNV || null)
            .execute('LapHopDong');

        return result.recordset[0].MaHopDong;
    } catch (err) {
        console.error('SQL Error in createContract:', err);
        throw err;
    }
};

const createBienBan = async (MaHD, MaNV = null) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .input('MaNV', mssql.VarChar(50), MaNV)
        .execute('LapBienBan');
};

const getEquipmentList = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSThietBi');
    return result.recordset;
};

const getBienBanDetails = async (MaHD) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .execute('DisplayChiTietBienBan');
    return result.recordset;
};

const addBienBanDetail = async (MaHD, MaTB, SoLuong) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .input('MaTB', mssql.VarChar(50), MaTB)
        .input('SoLuong', mssql.Int, SoLuong)
        .execute('ThemChiTietBienBan');
};

const removeBienBanDetail = async (MaHD, MaTB) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .input('MaTB', mssql.VarChar(50), MaTB)
        .execute('XoaChiTietBienBan');
};

const deleteBienBan = async (MaHD) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .execute('XoaBienBan');
};

module.exports = {
    getPaidDepositsNoContract,
    getApprovedDepositsNoContract,
    getContractList,
    approveDeposit,
    rejectDeposit,
    createContract,
    createBienBan,
    getEquipmentList,
    getBienBanDetails,
    addBienBanDetail,
    removeBienBanDetail,
    deleteBienBan,
};