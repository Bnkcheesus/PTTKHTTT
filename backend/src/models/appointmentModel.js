const { poolPromise, mssql } = require('../config/db');

const LayDSKhachChuaHen = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSKhachChuaHen');
    return result.recordset;
};

const KiemTraTrungLich = async (ThoiGian, MaNV) => {
    // 1. KIỂM TRA NGÀY QUÁ KHỨ
    const ngayHen = new Date(ThoiGian);
    const bayGio = new Date();

    if (ngayHen < bayGio) {
        // Lỗi này sẽ được catch ở Route và hiện lên Pop-up đỏ ở Frontend
        throw new Error("Thời gian hẹn không được ở trong quá khứ!");
    }

    const pool = await poolPromise;
    // Gọt sạch chữ 'T' và 'Z' để SQL Server nhận diện đúng kiểu DATETIME
    const thoiGianSach = ThoiGian.replace('T', ' ').replace(/\..*$/, '');

    const result = await pool.request()
        .input('ThoiGian', mssql.VarChar, thoiGianSach) 
        .input('MaNV', mssql.VarChar, MaNV)
        .execute('KiemTraTrungLich');
    
    return result.recordset[0].IsTrungLich;
};

const ThemLichHen = async (data) => {
    const pool = await poolPromise;
    const thoiGianSach = data.ThoiGian.replace('T', ' ').replace(/\..*$/, '');

    const result = await pool.request()
        // Đã đổi thành mssql.VarChar ở đây luôn
        .input('ThoiGian', mssql.VarChar, thoiGianSach) 
        .input('LyDo', mssql.NVarChar, data.LyDo)
        .input('MaPhieuYC', mssql.VarChar, data.MaPhieuYC)
        .input('MaNV', mssql.VarChar, data.MaNV)
        .execute('ThemLichHen');
        
    return result.recordset[0].MaLHMoi;
};

const LayChiTietPYCTuMaKH = async (MaKH) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKH', mssql.VarChar(50), MaKH)
        .execute('LayChiTietPYCTuMaKH');
    return result.recordset[0] || null; // Lấy chi tiết phiếu yêu cầu của khách đó
};

module.exports = { 
    LayDSKhachChuaHen,
    KiemTraTrungLich,
    ThemLichHen,
    LayChiTietPYCTuMaKH
};