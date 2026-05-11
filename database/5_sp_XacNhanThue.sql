USE QUANLYKHACHSAN
GO

-- Lấy thông tin phiếu yêu cầu theo mã phiếu
CREATE OR ALTER PROCEDURE LayChiTietPYC_MaPYC
    @MaPhieuYC VARCHAR(50)
AS
BEGIN
    SELECT *
    FROM PHIEUYEUCAU
    WHERE MaPhieuYC = @MaPhieuYC
END
GO

-- Lấy thông tin phiếu yêu cầu theo mã KH và thời gian thuê dự kiến
CREATE OR ALTER PROCEDURE LayChiTietPYC_MaKH_ThoiGian
    @MaKH VARCHAR(50),
	@ThoiGianDuKien NVARCHAR(100)
AS
BEGIN
    SELECT *
    FROM PHIEUYEUCAU
    WHERE MaKH = @MaKH AND ThoiGianDuKien = @ThoiGianDuKien
END
GO

-- Lấy danh sách thông tin các giường thuộc một phòng cụ thể
CREATE OR ALTER PROCEDURE LayDanhSachGiuong_Phong
    @MaPhong VARCHAR(50)
AS
BEGIN
    SELECT *
    FROM GIUONG
    WHERE MaPhong = @MaPhong
END
GO

-- Lấy thông tin phiếu đặt cọc theo mã PDC
CREATE OR ALTER PROCEDURE LayThongTinPhieuDatCoc_MaPDC
    @MaPDC VARCHAR(50)
AS
BEGIN
    SELECT *
    FROM PHIEUDATCOC
    WHERE MaPhieuDatCoc = @MaPDC
END
GO

-- Lấy thông tin phiếu đặt cọc theo mã PYC
CREATE OR ALTER PROCEDURE LayThongTinPhieuDatCoc_MaPYC
    @MaPYC VARCHAR(50)
AS
BEGIN
    SELECT *
    FROM PHIEUDATCOC
    WHERE MaPhieuYC = @MaPYC
END
GO

-- Thêm Phiếu Đặt Cọc
CREATE OR ALTER PROCEDURE ThemPDC
    @TienCoc DECIMAL(18, 2),
    @MaKH VARCHAR(50),
    @MaNV VARCHAR(50) = NULL, --Default to null
    @MaPhong VARCHAR(50),
    @MaPhieuYC VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NextNum INT;
    DECLARE @MaPhieuDatCoc VARCHAR(50);

    DECLARE @HinhThucThue NVARCHAR(100);
    DECLARE @SoNguoiDuKien INT;

    -- Variables xử lý giường
    DECLARE @MaGiuong VARCHAR(50);

    --------------------------------------------------------
    -- Lấy thông tin phiếu yêu cầu
    --------------------------------------------------------
    SELECT 
        @HinhThucThue = HinhThucThue,
        @SoNguoiDuKien = SoNguoiDuKien
    FROM PHIEUYEUCAU
    WHERE MaPhieuYC = @MaPhieuYC;

    --------------------------------------------------------
    -- Sinh mã PDC mới
    --------------------------------------------------------
    SELECT 
        @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaPhieuDatCoc, 4, 10) AS INT)), 0) + 1
    FROM PHIEUDATCOC;

    SET @MaPhieuDatCoc = 'PDC' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    --------------------------------------------------------
    -- Insert PHIEUDATCOC
    --------------------------------------------------------
    INSERT INTO PHIEUDATCOC
    (
        MaPhieuDatCoc,
        NgayLap,
        LoaiDatCoc,
        TrangThai,
        TienCoc,
        MaKH,
        MaNV,
        MaPhong,
        MaPhieuYC
    )
    VALUES
    (
        @MaPhieuDatCoc,
        GETDATE(),
        N'Cọc giữ chỗ',
        N'Chưa thanh toán',
        @TienCoc,
        @MaKH,
        @MaNV,
        @MaPhong,
        @MaPhieuYC
    );

    
    SELECT @MaPhieuDatCoc AS MaPhieuDatCocMoi;

END
GO

-- Thêm Chi Tiết Đặt Cọc
CREATE OR ALTER PROCEDURE ThemChiTietDatCoc
    @MaPhieuDatCoc VARCHAR(50),
	@MaGiuong VARCHAR(50)
AS
BEGIN
	-- Kiểm tra trạng thái giường
    IF EXISTS (
        SELECT 1
        FROM GIUONG
        WHERE MaGiuong = @MaGiuong
          AND TrangThai = N'Đã có người'
    )
    BEGIN
        RAISERROR (N'Giường này đã có người, không thể đặt cọc!', 16, 1);
        RETURN;
    END

    INSERT INTO CHITIETDATCOC (MaPhieuDatCoc, MaGiuong)
    VALUES (@MaPhieuDatCoc, @MaGiuong);
END
GO
CREATE OR ALTER PROCEDURE CapNhatThongTinKH
    @MaKH VARCHAR(50),
    @HoTen NVARCHAR(100),
    @SDT VARCHAR(20),
    @Email VARCHAR(100),
    @GioiTinh NVARCHAR(10)
AS
BEGIN
    UPDATE KHACHHANG
    SET HoTen = @HoTen, 
        SDT = @SDT, 
        Email = @Email, 
        GioiTinh = @GioiTinh
    WHERE MaKH = @MaKH
END
GO

