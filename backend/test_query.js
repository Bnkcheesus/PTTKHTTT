const mssql = require('mssql/msnodesqlv8');
const config = { connectionString: 'Driver={SQL Server};Server=localhost;Database=QUANLYKHACHSAN;Trusted_Connection=Yes;' };

const sql = `SELECT DISTINCT
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
    l.ThoiGian AS ThoiGianHen
FROM LICHHEN l
JOIN PHIEUYEUCAU pyc ON l.MaPhieuYC = pyc.MaPhieuYC
JOIN KHACHHANG kh ON pyc.MaKH = kh.MaKH
LEFT JOIN PHONG p ON pyc.MaPhong = p.MaPhong
WHERE NOT EXISTS (
    SELECT 1 FROM PHIEUDATCOC pdc WHERE pdc.MaPhieuYC = pyc.MaPhieuYC
)
AND pyc.MaPhieuYC = 'PYC084'
ORDER BY l.ThoiGian DESC`;

mssql.connect(config).then(pool => {
    pool.request().query(sql).then(r => {
        console.log(JSON.stringify(r.recordset, null, 2));
        process.exit(0);
    }).catch(e => {
        console.error(e.message);
        process.exit(1);
    });
}).catch(e => {
    console.error(e.message);
    process.exit(1);
});