USE QUANLYKHACHSAN
GO
CREATE OR ALTER PROCEDURE sp_GetAllDepositPaid
AS
BEGIN
	SELECT MaPhieuDatCoc, HoTen, NgayLap, MaNhom
	FROM PHIEUDATCOC
	JOIN KHACHHANG ON KHACHHANG.MaKH = PHIEUDATCOC.MaKH
	LEFT JOIN CHITIET_NHOMTHUE ON CHITIET_NHOMTHUE.MAKH = KHACHHANG.MaKH
	WHERE TrangThai = N'Đã thanh toán' AND NOT EXISTS (
		SELECT MaPhieuDatCoc FROM HOPDONG
	)
END
GO
EXEC sp_GetAllDepositPaid;

GO
CREATE OR ALTER PROCEDURE sp_DuyetDatCoc
	@maPhieu VARCHAR(50)
AS	
BEGIN
	UPDATE PHIEUDATCOC
	SET TrangThai = N'Được chấp thuận'
	WHERE MaPhieuDatCoc = @maPhieu
END

GO
CREATE OR ALTER PROCEDURE sp_TuChoiDatCoc
	@maPhieu VARCHAR(50)
AS	
BEGIN
	UPDATE PHIEUDATCOC
	SET TrangThai = N'Không được chấp thuận'
	WHERE MaPhieuDatCoc = @maPhieu
END

GO
CREATE OR ALTER PROCEDURE LayDSDatCocDuocDuyet
AS
BEGIN
	SELECT MaPhieuDatCoc, HoTen, NgayLap, MaNhom
	FROM PHIEUDATCOC
	JOIN KHACHHANG ON KHACHHANG.MaKH = PHIEUDATCOC.MaKH
	LEFT JOIN CHITIET_NHOMTHUE ON CHITIET_NHOMTHUE.MAKH = KHACHHANG.MaKH
	WHERE TrangThai = N'Được chấp thuận' AND NOT EXISTS (
		SELECT MaPhieuDatCoc FROM HOPDONG
	)	
END

GO
CREATE OR ALTER PROCEDURE LapHopDong
    @MaPhieu VARCHAR(50),
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @NoiDungHD NVARCHAR(500)
AS
BEGIN
    DECLARE @MaHD VARCHAR(50);
	DECLARE @NgayKy Date;
    DECLARE @NextNum INT;

    -- 1. Find the highest current number in the MaHopDong column
    -- SUBSTRING starts from the 3rd character (after 'HD')
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaHopDong, 3, 10) AS INT)), 0) + 1
    FROM HOPDONG;

    -- 2. Format the new ID (HD + leading zeros + the next number)
    -- This ensures a format like HD001, HD010, etc.
    SET @MaHD = 'HD' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

	SET @NgayKy = CAST(GETDATE() AS DATE);

    -- 3. Insert the new record
    INSERT INTO HOPDONG (MaHopDong, NgayKy, NgayBatDau, NgayKetThuc, NoiDungHD, MaPhieuDatCoc)
    VALUES (@MaHD, @NgayKy, @NgayBatDau, @NgayKetThuc, @NoiDungHD, @MaPhieu);
END;

GO
CREATE OR ALTER PROCEDURE LapBienBan
    @MaHD VARCHAR(50)
AS
BEGIN
    DECLARE @MaBB VARCHAR(50);
    DECLARE @NgayLap DATE;
    DECLARE @NextNum INT;
	DECLARE @validateBB VARCHAR(50)
	SET @validateBB = (SELECT MaBienBan FROM BIENBAN WHERE MaHopDong = @MaHD)
	IF (@validateBB IS NOT NULL)
		RETURN;
    -- 1. Generate the ID based on the current maximum in the table
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaBienBan, 3, 10) AS INT)), 0) + 1
    FROM BIENBAN;

    -- 2. Format the ID (e.g., BB001)
    SET @MaBB = 'BB' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    -- 3. Get the current computer/server date
    SET @NgayLap = CAST(GETDATE() AS DATE);

    -- 4. Insert the new record (leaving MaNV as NULL)
    INSERT INTO BIENBAN (MaBienBan, NgayLap, MaHopDong)
    VALUES (@MaBB, @NgayLap, @MaHD);
END;

GO
CREATE OR ALTER PROCEDURE DisplayChiTietBienBan
	@MaHD VARCHAR(50)
AS
BEGIN
    DECLARE @MaBB VARCHAR(50);
    
	SET @MaBB = (SELECT MaBienBan FROM BIENBAN WHERE MaHopDong = @MaHD)

	IF (@MaBB IS NULL)
		RETURN;
	SELECT BIENBAN_THIETBI.MaThietBi, THIETBI.TenThietBi, BIENBAN_THIETBI.SoLuong
	FROM BIENBAN_THIETBI
	JOIN THIETBI ON THIETBI.MaThietBi = BIENBAN_THIETBI.MaThietBi
	WHERE MaBienBan = @MaBB
END;

GO
CREATE OR ALTER PROCEDURE LayDSThietBi
AS
BEGIN
	SELECT THIETBI.MaThietBi, THIETBI.TenThietBi
	FROM THIETBI
END


GO
CREATE OR ALTER PROCEDURE ThemChiTietBienBan
	@MaHD VARCHAR(50),
	@MaTB VARCHAR(50),
	@SoLuong INT
AS
BEGIN
    DECLARE @MaBB VARCHAR(50);
    
	SET @MaBB = (SELECT MaBienBan FROM BIENBAN WHERE MaHopDong = @MaHD)

	IF (@MaBB IS NULL)
		RETURN;
	
	IF (@SoLuong < 0)
		RETURN;
	IF EXISTS (SELECT * FROM BIENBAN_THIETBI WHERE MaBienBan = @MaBB AND MaThietBi = @MaTB)
		RETURN;

	INSERT INTO BIENBAN_THIETBI (MaBienBan, MaThietBi, SoLuong) VALUES (@MaBB, @MaTB, @SoLuong)
END;

GO
CREATE OR ALTER PROCEDURE XoaChiTietBienBan
	@MaHD VARCHAR(50),
	@MaTB VARCHAR(50)
AS
BEGIN
    DECLARE @MaBB VARCHAR(50);
    
	SET @MaBB = (SELECT MaBienBan FROM BIENBAN WHERE MaHopDong = @MaHD)

	IF (@MaBB IS NULL)
		RETURN;
	
	DELETE FROM BIENBAN_THIETBI WHERE MaBienBan = @MaBB  AND MaThietBi = @MaTB;	
END;
