USE QUANLYKHACHSAN
GO

-- Lấy danh sách tất cả các phòng
CREATE OR ALTER PROCEDURE LayDanhSachPhong
AS
BEGIN
    SELECT MaPhong, SoNguoiThueToiDa, GiaThuePhong, TrangThai, DieuKienChoThue, MaKV, MaLoai
    FROM PHONG
END
GO

-- Lấy chi tiết thông tin của một phòng cụ thể
CREATE OR ALTER PROCEDURE LayChiTietPhong
    @MaPhong VARCHAR(50)
AS
BEGIN
    SELECT MaPhong, SoNguoiThueToiDa, GiaThuePhong, TrangThai, DieuKienChoThue, MaKV, MaLoai
    FROM PHONG
    WHERE MaPhong = @MaPhong
END
GO

-- Cập nhật trạng thái của một phòng
CREATE OR ALTER PROCEDURE CapNhatTrangThaiPhong
    @MaPhong VARCHAR(50),
    @TT NVARCHAR(50)
AS
BEGIN
    UPDATE PHONG
    SET TrangThai = @TT
    WHERE MaPhong = @MaPhong
END
GO

-- Lấy chi tiết thông tin của một khách hàng cụ thể dựa vào Mã CCCD
CREATE OR ALTER PROCEDURE LayChiTietKH_CCCD
    @CCCD VARCHAR(20)
AS
BEGIN
    SELECT MaKH, HoTen, SDT, Email, GioiTinh, CCCD
    FROM KHACHHANG
    WHERE CCCD = @CCCD
END
GO

-- Thêm một khách hàng mới
CREATE OR ALTER PROCEDURE ThemKH
    @HoTen NVARCHAR(100),
    @SDT VARCHAR(20),
    @Email VARCHAR(100),
    @GioiTinh NVARCHAR(10),
    @CCCD VARCHAR(20)
AS
BEGIN
    DECLARE @NextNum INT;
    DECLARE @MaKH VARCHAR(50);

    -- Tự động sinh mã KH mới (VD: KH001, KH102...)
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaKH, 3, 10) AS INT)), 0) + 1 FROM KHACHHANG;
    SET @MaKH = 'KH' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    -- Insert vào DB
    INSERT INTO KHACHHANG (MaKH, HoTen, SDT, Email, GioiTinh, CCCD)
    VALUES (@MaKH, @HoTen, @SDT, @Email, @GioiTinh, @CCCD);

    -- Trả về mã vừa sinh ra để code C# bắt lấy
    SELECT @MaKH AS MaKHMoi;
END
GO

-- Thêm một nhóm thuê mới
CREATE OR ALTER PROCEDURE ThemNhom
    @MaKHDaiDien VARCHAR(50)
AS
BEGIN
    DECLARE @NextNum INT;
    DECLARE @MaNhom VARCHAR(50);

    -- Tự động sinh mã Nhóm mới (VD: NHOM01, NHOM16...)
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaNhom, 5, 10) AS INT)), 0) + 1 FROM NHOMTHUE;
    SET @MaNhom = 'NHOM' + RIGHT('00' + CAST(@NextNum AS VARCHAR(10)), 2);

    -- Insert vào DB
    INSERT INTO NHOMTHUE (MaNhom, MaKHDaiDien)
    VALUES (@MaNhom, @MaKHDaiDien);

    -- Trả về mã vừa sinh ra
    SELECT @MaNhom AS MaNhomMoi;
END
GO

-- Thêm chi tiết nhóm thuê
CREATE OR ALTER PROCEDURE ThemCTNhom
    @MaNhom VARCHAR(50),
    @MaKH VARCHAR(50)
AS
BEGIN
    INSERT INTO CHITIET_NHOMTHUE (MaNhom, MaKH)
    VALUES (@MaNhom, @MaKH)
END
GO

-- Thêm Phiếu Yêu Cầu
CREATE OR ALTER PROCEDURE ThemPYC
    @SoNguoiDuKien INT,
    @KhoangGia DECIMAL(18, 2),
    @ThoiGianDuKien NVARCHAR(100),
    @GhiChu NVARCHAR(255),
    @HinhThucThue NVARCHAR(100),
    @MaKH VARCHAR(50),
    @MaKV VARCHAR(50) = NULL,
    @MaLoai VARCHAR(50) = NULL,
    @MaPhong VARCHAR(50)
AS
BEGIN
    DECLARE @NextNum INT;
    DECLARE @MaPhieuYC VARCHAR(50);

    -- Tự động sinh mã PYC mới (VD: PYC001, PYC081...)
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaPhieuYC, 4, 10) AS INT)), 0) + 1 FROM PHIEUYEUCAU;
    SET @MaPhieuYC = 'PYC' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    -- Insert vào DB
    INSERT INTO PHIEUYEUCAU (MaPhieuYC, SoNguoiDuKien, KhoangGia, ThoiGianDuKien, GhiChu, HinhThucThue, MaKH, MaKV, MaLoai, MaPhong)
    VALUES (@MaPhieuYC, @SoNguoiDuKien, @KhoangGia, @ThoiGianDuKien, @GhiChu, @HinhThucThue, @MaKH, @MaKV, @MaLoai, @MaPhong);

    -- Trả về mã vừa sinh ra
    SELECT @MaPhieuYC AS MaPhieuYCMoi;
END
GO