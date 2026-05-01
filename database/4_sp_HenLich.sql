USE QUANLYKHACHSAN
GO

-- Lấy danh sách khách hàng chưa có lịch hẹn
CREATE OR ALTER PROCEDURE LayDSKhachChuaHen
AS
BEGIN
    SELECT 
        PYC.MaPhieuYC, 
        KH.MaKH, 
        KH.HoTen, 
        KH.SDT, 
        PYC.SoNguoiDuKien, 
        PYC.ThoiGianDuKien, 
        PYC.HinhThucThue
    FROM PHIEUYEUCAU PYC
    JOIN KHACHHANG KH ON PYC.MaKH = KH.MaKH
    WHERE NOT EXISTS (
        SELECT 1 FROM LICHHEN LH WHERE LH.MaPhieuYC = PYC.MaPhieuYC
    )
END
GO

-- Lấy thông tin chi tiết của Phiếu yêu cầu dựa vào Mã Khách Hàng
CREATE OR ALTER PROCEDURE LayChiTietPYCTuMaKH
    @MaKH VARCHAR(50)
AS
BEGIN
    SELECT 
        MaPhieuYC, 
        SoNguoiDuKien, 
        KhoangGia, 
        ThoiGianDuKien, 
        GhiChu, 
        HinhThucThue, 
        MaKV, 
        MaLoai,
        MaPhong -- ĐÃ BỔ SUNG MAPHONG
    FROM PHIEUYEUCAU
    WHERE MaKH = @MaKH
END
GO

-- Lấy thông tin chi tiết của một khách hàng cụ thể
CREATE OR ALTER PROCEDURE LayChiTietKH
    @MaKH VARCHAR(50)
AS
BEGIN
    SELECT 
        MaKH, 
        HoTen, 
        SDT, 
        Email, 
        GioiTinh, 
        CCCD
    FROM KHACHHANG
    WHERE MaKH = @MaKH
END
GO

-- Thêm một lịch hẹn mới
CREATE OR ALTER PROCEDURE ThemLichHen
    @ThoiGian DATETIME,
    @LyDo NVARCHAR(255),
    @MaPhieuYC VARCHAR(50),
    @MaNV VARCHAR(50)
AS
BEGIN
    DECLARE @NextNum INT;
    DECLARE @MaLH VARCHAR(50);

    -- Tự động sinh mã Lịch Hẹn mới (VD: LH001, LH081...)
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaLH, 3, 10) AS INT)), 0) + 1 FROM LICHHEN;
    SET @MaLH = 'LH' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    -- Insert vào DB
    INSERT INTO LICHHEN (MaLH, ThoiGian, LyDo, MaPhieuYC, MaNV)
    VALUES (@MaLH, @ThoiGian, @LyDo, @MaPhieuYC, @MaNV);

    -- Trả về mã vừa sinh ra
    SELECT @MaLH AS MaLHMoi;
END
GO

-- Kiểm tra trùng lịch hẹn cho một nhân viên tại một thời điểm cụ thể
CREATE OR ALTER PROCEDURE KiemTraTrungLich
    @ThoiGian DATETIME,
    @MaNV VARCHAR(50)
AS
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM LICHHEN 
        WHERE ThoiGian = @ThoiGian AND MaNV = @MaNV
    )
    BEGIN
        SELECT 1 AS IsTrungLich -- Có trùng
    END
    ELSE
    BEGIN
        SELECT 0 AS IsTrungLich -- Không trùng (Hợp lệ)
    END
END
GO