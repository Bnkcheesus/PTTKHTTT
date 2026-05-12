const { poolPromise, mssql } = require('../config/db');

const getAllCustomers = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM KHACHHANG');
    return result.recordset;
};

const getCustomerById = async (MaKH) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKH', mssql.VarChar(50), MaKH)
        .query('SELECT * FROM KHACHHANG WHERE MaKH = @MaKH');
    return result.recordset[0] || null;
};

const searchCustomers = async (searchTerm) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('searchTerm', mssql.NVarChar(100), `%${searchTerm}%`)
        .query(`
            SELECT * FROM KHACHHANG 
            WHERE HoTen LIKE @searchTerm 
               OR SDT LIKE @searchTerm 
               OR Email LIKE @searchTerm
               OR MaKH LIKE @searchTerm
        `);
    return result.recordset;
};

const ThemKH = async (data) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('HoTen', mssql.NVarChar, data.HoTen || data.hoTen || '')
        .input('SDT', mssql.VarChar, data.SDT || data.sdt || '')
        .input('Email', mssql.VarChar, data.Email || data.email || '')
        .input('GioiTinh', mssql.NVarChar, data.GioiTinh || data.gioiTinh || '')
        .input('CCCD', mssql.VarChar, data.CCCD || data.cccd || '')
        .execute('ThemKH');
    return result.recordset[0].MaKHMoi;
};

const ThemNhom = async (maKHDaiDien) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKHDaiDien', mssql.VarChar(50), maKHDaiDien)
        .execute('ThemNhom'); 
    return result.recordset[0].MaNhomMoi; 
};

const ThemCTNhom = async (maNhom, maKH) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaNhom', mssql.VarChar(50), maNhom)
        .input('MaKH', mssql.VarChar(50), maKH)
        .execute('ThemCTNhom');
};

const ThemPYC = async (data) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('SoNguoiDuKien', mssql.Int, data.SoNguoiDuKien || data.soNguoiDuKien)
        .input('KhoangGia', mssql.Decimal, data.KhoangGia || data.khoangGia)
        .input('ThoiGianDuKien', mssql.NVarChar, data.ThoiGianDuKien || data.thoiGianDuKien || '')
        .input('GhiChu', mssql.NVarChar, data.GhiChu || data.ghiChu || '')
        .input('HinhThucThue', mssql.NVarChar, data.HinhThucThue || data.hinhThucThue || '')
        .input('MaKH', mssql.VarChar, data.MaKH || data.maKH)
        .input('MaKV', mssql.VarChar, data.MaKV || data.maKV)
        .input('MaLoai', mssql.VarChar, data.MaLoai || data.maLoai)
        .input('MaPhong', mssql.VarChar, data.MaPhong || data.maPhong)
        .execute('ThemPYC');
    return result.recordset[0].MaPhieuYCMoi;
};

const LayThongTinKH = async (CCCD) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('CCCD', mssql.VarChar(20), CCCD)
        .execute('LayChiTietKH_CCCD');
    return result.recordset[0] || null; // Trả về thông tin khách hoặc null nếu là khách mới
};

const registerGroupFlow = async (daiDienInfo, khachPhuList, requestInfo) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Tạo Khách hàng Đại diện
        const resDaiDien = await transaction.request()
            .input('HoTen', mssql.NVarChar(100), daiDienInfo.HoTen || daiDienInfo.hoTen || '')
            .input('SDT', mssql.VarChar(20), daiDienInfo.SDT || daiDienInfo.sdt || '')
            .input('Email', mssql.VarChar(100), daiDienInfo.Email || daiDienInfo.email || '')
            .input('GioiTinh', mssql.NVarChar(10), daiDienInfo.GioiTinh || daiDienInfo.gioiTinh || '')
            .input('CCCD', mssql.VarChar(20), daiDienInfo.CCCD || daiDienInfo.cccd || '')
            .execute('ThemKH');
        const maKHDaiDien = resDaiDien.recordset[0].MaKHMoi;

        // Tạo Nhóm và lưu Đại diện vào nhóm
        const resNhom = await transaction.request()
            .input('MaKHDaiDien', mssql.VarChar(50), maKHDaiDien)
            .execute('ThemNhom');
        const maNhom = resNhom.recordset[0].MaNhomMoi;

        await transaction.request()
            .input('MaNhom', mssql.VarChar(50), maNhom)
            .input('MaKH', mssql.VarChar(50), maKHDaiDien)
            .execute('ThemCTNhom');

        // Tạo Phiếu Yêu Cầu cho Đại diện
        await transaction.request()
            .input('SoNguoiDuKien', mssql.Int, requestInfo.SoNguoiDuKien)
            .input('KhoangGia', mssql.Decimal(18, 2), requestInfo.KhoangGia)
            .input('ThoiGianDuKien', mssql.NVarChar(100), requestInfo.ThoiGianDuKien)
            .input('GhiChu', mssql.NVarChar(255), requestInfo.GhiChu || '')
            .input('HinhThucThue', mssql.NVarChar(100), requestInfo.HinhThucThue || '')
            .input('MaKH', mssql.VarChar(50), maKHDaiDien)
            .input('MaKV', mssql.VarChar(50), requestInfo.MaKV || '')
            .input('MaLoai', mssql.VarChar(50), requestInfo.MaLoai || '')
            .input('MaPhong', mssql.VarChar(50), requestInfo.MaPhong || '')
            .execute('ThemPYC');

        // 2. TẠO KHÁCH HÀNG PHỤ VÀ PHIẾU YÊU CẦU RIÊNG CHO HỌ
        if (khachPhuList && khachPhuList.length > 0) {
            for (const khach of khachPhuList) {
                const resKhachPhu = await transaction.request()
                    .input('HoTen', mssql.NVarChar(100), khach.HoTen || khach.hoTen || '')
                    .input('SDT', mssql.VarChar(20), khach.SDT || khach.sdt || '')
                    .input('Email', mssql.VarChar(100), khach.Email || khach.email || '')
                    .input('GioiTinh', mssql.NVarChar(10), khach.GioiTinh || khach.gioiTinh || '')
                    .input('CCCD', mssql.VarChar(20), khach.CCCD || khach.cccd || '')
                    .execute('ThemKH');
                const maKHPhu = resKhachPhu.recordset[0].MaKHMoi;

                await transaction.request()
                    .input('MaNhom', mssql.VarChar(50), maNhom)
                    .input('MaKH', mssql.VarChar(50), maKHPhu)
                    .execute('ThemCTNhom');

                await transaction.request()
                    .input('SoNguoiDuKien', mssql.Int, requestInfo.SoNguoiDuKien)
                    .input('KhoangGia', mssql.Decimal(18, 2), requestInfo.KhoangGia)
                    .input('ThoiGianDuKien', mssql.NVarChar(100), requestInfo.ThoiGianDuKien)
                    .input('GhiChu', mssql.NVarChar(255), requestInfo.GhiChu || '')
                    .input('HinhThucThue', mssql.NVarChar(100), requestInfo.HinhThucThue || '')
                    .input('MaKH', mssql.VarChar(50), maKHPhu)
                    .input('MaKV', mssql.VarChar(50), requestInfo.MaKV || '')
                    .input('MaLoai', mssql.VarChar(50), requestInfo.MaLoai || '')
                    .input('MaPhong', mssql.VarChar(50), requestInfo.MaPhong || '')
                    .execute('ThemPYC');
            }
        }

        await transaction.commit();
        return { success: true, maNhom };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
    ThemKH,
    ThemNhom,
    ThemCTNhom,
    ThemPYC,
    LayThongTinKH,
    registerGroupFlow
};