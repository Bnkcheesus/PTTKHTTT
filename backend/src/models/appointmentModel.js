const { poolPromise, mssql } = require('../config/db');

const LayDSKhachChuaHen = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT DISTINCT
            KH.MaKH, KH.HoTen, KH.CCCD, KH.SDT, KH.Email, KH.GioiTinh,
            PYC.MaPhieuYC, PYC.SoNguoiDuKien, PYC.ThoiGianDuKien, PYC.HinhThucThue,
            P.MaPhong,
            CN.MaNhom -- BẮT BUỘC PHẢI THÊM CỘT NÀY ĐỂ REACT NHÌN THẤY MÃ NHÓM
        FROM PHIEUYEUCAU PYC
        JOIN KHACHHANG KH ON PYC.MaKH = KH.MaKH
        LEFT JOIN PHONG P ON PYC.MaPhong = P.MaPhong
        LEFT JOIN CHITIET_NHOMTHUE CN ON CN.MaKH = KH.MaKH
        WHERE NOT EXISTS (
            SELECT 1 FROM LICHHEN LH 
            WHERE LH.MaPhieuYC = PYC.MaPhieuYC
               OR (CN.MaNhom IS NOT NULL AND LH.MaPhieuYC IN (
                   SELECT PYC2.MaPhieuYC FROM CHITIET_NHOMTHUE CN2 
                   JOIN PHIEUYEUCAU PYC2 ON CN2.MaKH = PYC2.MaKH 
                   WHERE CN2.MaNhom = CN.MaNhom
               ))
        )
        ORDER BY PYC.MaPhieuYC DESC
    `);
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

const LayDSYCCoLichChoXacNhan = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT DISTINCT
            pyc.MaPhieuYC,
            kh.MaKH,
            kh.HoTen,
            kh.SDT,
            kh.Email,
            kh.CCCD,
            pyc.MaPhong,
            p.GiaThuePhong,
            p.TrangThai AS TinhTrangPhong,
            pyc.HinhThucThue,
            pyc.SoNguoiDuKien,
            pyc.ThoiGianDuKien,
            l.MaLH,
            l.ThoiGian AS ThoiGianHen,
            CN.MaNhom
        FROM PHIEUYEUCAU pyc
        JOIN KHACHHANG kh ON pyc.MaKH = kh.MaKH
        LEFT JOIN PHONG p ON pyc.MaPhong = p.MaPhong
        LEFT JOIN CHITIET_NHOMTHUE CN ON CN.MaKH = kh.MaKH
        CROSS APPLY (
            SELECT TOP 1 lh.MaLH, lh.ThoiGian
            FROM LICHHEN lh
            WHERE lh.MaPhieuYC = pyc.MaPhieuYC 
               OR (CN.MaNhom IS NOT NULL AND lh.MaPhieuYC IN (
                   SELECT pyc2.MaPhieuYC 
                   FROM CHITIET_NHOMTHUE cn2 
                   JOIN PHIEUYEUCAU pyc2 ON cn2.MaKH = pyc2.MaKH 
                   WHERE cn2.MaNhom = CN.MaNhom
               ))
            ORDER BY lh.ThoiGian DESC
        ) l
        WHERE NOT EXISTS (
            SELECT 1 FROM PHIEUDATCOC pdc WHERE pdc.MaPhieuYC = pyc.MaPhieuYC
        )
        ORDER BY ThoiGianHen DESC, pyc.MaPhieuYC DESC
    `);
    return result.recordset;
};

module.exports = { 
    LayDSKhachChuaHen,
    KiemTraTrungLich,
    ThemLichHen,
    LayChiTietPYCTuMaKH,
    LayDSYCCoLichChoXacNhan
};