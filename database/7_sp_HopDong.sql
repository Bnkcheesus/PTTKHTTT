USE QUANLYKHACHSAN
GO
CREATE OR ALTER PROCEDURE sp_GetAllDepositPaid
AS
BEGIN
    SELECT 
        P.MaPhieuDatCoc, 
        K.HoTen, 
        P.NgayLap, 
        CN.MaNhom
    FROM PHIEUDATCOC P
    JOIN KHACHHANG K ON K.MaKH = P.MaKH
    LEFT JOIN CHITIET_NHOMTHUE CN ON CN.MaKH = K.MaKH
    WHERE P.TrangThai = N'Đã thanh toán' AND 
	P.MaPhieuDatCoc NOT IN (SELECT MaPhieuDatCoc FROM HOPDONG WHERE MaPhieuDatCoc IS NOT NULL)
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
	WHERE TrangThai = N'Được chấp thuận' AND MaPhieuDatCoc NOT IN (
		SELECT MaPhieuDatCoc FROM HOPDONG
	)	
END

GO
CREATE OR ALTER PROCEDURE LapHopDong
    @MaPhieu VARCHAR(50),
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @NoiDungHD NVARCHAR(500),
    @MaNV VARCHAR(50) = NULL -- Defaulted to NULL
AS
BEGIN
    DECLARE @MaHD VARCHAR(50);
    DECLARE @NgayKy DATE;
    DECLARE @NextNum INT;

    -- 1. Find the highest current number for ID generation
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaHopDong, 3, 10) AS INT)), 0) + 1
    FROM HOPDONG;

    -- 2. Format the new ID (HD001, HD002...)
    SET @MaHD = 'HD' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);
    SET @NgayKy = CAST(GETDATE() AS DATE);

    -- 3. Insert the new record including @MaNV
    INSERT INTO HOPDONG (MaHopDong, NgayKy, NgayBatDau, NgayKetThuc, NoiDungHD, MaPhieuDatCoc, MaNV)
    VALUES (@MaHD, @NgayKy, @NgayBatDau, @NgayKetThuc, @NoiDungHD, @MaPhieu, @MaNV);
    -- 3. Return the ID for Node.js to capture
    SELECT @MaHD AS MaHopDong;
END;

GO
CREATE OR ALTER PROCEDURE LayDSHopDong
AS
BEGIN
	SELECT MaHopDong, NgayKy, HoTen
	FROM HOPDONG
	JOIN PHIEUDATCOC ON HOPDONG.MaPhieuDatCoc = PHIEUDATCOC.MaPhieuDatCoc
	JOIN KHACHHANG ON PHIEUDATCOC.MaKH = KHACHHANG.MaKH
END;

GO
CREATE OR ALTER PROCEDURE LapBienBan
    @MaHD VARCHAR(50),
    @MaNV VARCHAR(50) = NULL -- Defaulted to NULL
AS
BEGIN
    DECLARE @MaBB VARCHAR(50);
    DECLARE @NgayLap DATE;
    DECLARE @NextNum INT;
    DECLARE @validateBB VARCHAR(50);

    -- Check if a record already exists for this contract
    SET @validateBB = (SELECT MaBienBan FROM BIENBAN WHERE MaHopDong = @MaHD);
    IF (@validateBB IS NOT NULL)
        RETURN;

    -- 1. Generate the ID (BB001, BB002...)
    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaBienBan, 3, 10) AS INT)), 0) + 1
    FROM BIENBAN;

    SET @MaBB = 'BB' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);
    SET @NgayLap = CAST(GETDATE() AS DATE);

    -- 2. Insert the new record including @MaNV
    INSERT INTO BIENBAN (MaBienBan, NgayLap, MaHopDong, MaNV)
    VALUES (@MaBB, @NgayLap, @MaHD, @MaNV);
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
GO
CREATE OR ALTER PROCEDURE XoaBienBan
	@MaHD VARCHAR(50)
AS
BEGIN
    DECLARE @MaBB VARCHAR(50);
    
	SET @MaBB = (SELECT MaBienBan FROM BIENBAN WHERE MaHopDong = @MaHD);

	IF (@MaBB IS NULL)
		RETURN;
	
	DELETE FROM BIENBAN_THIETBI WHERE MaBienBan = @MaBB;
	DELETE FROM BIENBAN WHERE MaHopDong = @MaHD;
END;

GO

CREATE OR ALTER PROCEDURE LayDS_ChoKiemTra
AS
BEGIN
    SELECT DISTINCT
        PTR.MaPhieuTra,
        HD.MaHopDong,
        PDC.MaPhieuDatCoc,
        KH.HoTen,
        P.MaPhong,
        HD.NgayBatDau,
        HD.NgayKetThuc
    FROM PHIEUTRAPHONG PTR
    JOIN PHIEUDATCOC PDC ON PTR.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
    JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    LEFT JOIN PHONG P ON PDC.MaPhong = P.MaPhong
    LEFT JOIN PHIEUKIEMTRA PKT ON PKT.MaPhieuTra = PTR.MaPhieuTra
    WHERE PTR.MaPhieuTra IS NOT NULL
      AND PKT.MaPhieuKiemTra IS NULL;
END;

GO

CREATE OR ALTER PROCEDURE LayThongTinBanGiao_TuHopDong
    @MaHopDong VARCHAR(50)
AS
BEGIN
    SELECT
        HD.MaHopDong,
        PDC.MaPhieuDatCoc,
        PTR.MaPhieuTra,
        P.MaPhong,
        P.GiaThuePhong,
        KH.HoTen,
        KH.SDT,
        KH.Email,
        HD.NgayBatDau,
        HD.NgayKetThuc
    FROM HOPDONG HD
    JOIN PHIEUDATCOC PDC ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
    LEFT JOIN PHONG P ON PDC.MaPhong = P.MaPhong
    LEFT JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    WHERE HD.MaHopDong = @MaHopDong;
END;

GO

CREATE OR ALTER PROCEDURE LapPhieuKiemTra
    @MaPhieuKiemTra VARCHAR(50) = NULL,
    @MaPhieuTra VARCHAR(50) = NULL,
    @SoDienDung FLOAT = 0,
    @SoNuocDung FLOAT = 0,
    @TienThueNo DECIMAL(18,2),
    @TienPhat DECIMAL(18,2),
    @MaNV VARCHAR(50)
AS
BEGIN
    IF @TienThueNo < 0
    BEGIN
        RAISERROR(N'Tiền thuê nợ phải lớn hơn hoặc bằng 0.', 16, 1);
        RETURN;
    END

    IF @TienPhat < 0
    BEGIN
        RAISERROR(N'Tiền phạt phải lớn hơn hoặc bằng 0.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM NV_QLY WHERE MaNV = @MaNV)
    BEGIN
        RAISERROR(N'Nhân viên không thuộc bộ phận quản lý.', 16, 1);
        RETURN;
    END

    IF @MaPhieuTra IS NULL
    BEGIN
        RAISERROR(N'Mã phiếu trả phòng chưa được xác định.', 16, 1);
        RETURN;
    END

    IF @MaPhieuKiemTra IS NULL
    BEGIN
        DECLARE @NextNum INT;
        SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaPhieuKiemTra, 4, 10) AS INT)), 0) + 1
        FROM PHIEUKIEMTRA;

        SET @MaPhieuKiemTra = 'PKT' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);
    END
    ELSE IF EXISTS (SELECT 1 FROM PHIEUKIEMTRA WHERE MaPhieuKiemTra = @MaPhieuKiemTra)
    BEGIN
        RAISERROR(N'Mã phiếu kiểm tra đã tồn tại.', 16, 1);
        RETURN;
    END

    INSERT INTO PHIEUKIEMTRA (MaPhieuKiemTra, SoDienDung, SoNuocDung, TienThueNo, TienPhat, MaPhieuTra, MaNV)
    VALUES (@MaPhieuKiemTra, @SoDienDung, @SoNuocDung, @TienThueNo, @TienPhat, @MaPhieuTra, @MaNV);

    SELECT @MaPhieuKiemTra AS MaPhieuKiemTra;
END;

GO

CREATE OR ALTER PROCEDURE ThemChiTietKiemTra
    @MaPhieuKiemTra VARCHAR(50),
    @MaThietBi VARCHAR(50),
    @SoLuongHuHong INT
AS
BEGIN
    IF @SoLuongHuHong < 0
    BEGIN
        RAISERROR(N'Số lượng hư hỏng phải lớn hơn hoặc bằng 0.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM PHIEUKIEMTRA WHERE MaPhieuKiemTra = @MaPhieuKiemTra)
    BEGIN
        RAISERROR(N'Phiếu kiểm tra không tồn tại.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM CHITIETKIEMTRA WHERE MaPhieuKiemTra = @MaPhieuKiemTra AND MaThietBi = @MaThietBi)
    BEGIN
        RAISERROR(N'Thiết bị đã được thêm vào phiếu kiểm tra.', 16, 1);
        RETURN;
    END

    INSERT INTO CHITIETKIEMTRA (MaPhieuKiemTra, MaThietBi, SoLuongHuHong)
    VALUES (@MaPhieuKiemTra, @MaThietBi, @SoLuongHuHong);
END;

GO

-- INSERT INTO PHIEUDATCOC (MaPhieuDatCoc, NgayLap, LoaiDatCoc, TrangThai, TienCoc, MaKH, MaNV) VALUES ('PDC1000', '2025-02-12', N'Cọc giữ chỗ', N'Đã thanh toán', 3500000, 'KH099', 'NV005');
-- SELECT * FROM PHIEUDATCOC WHERE MaPhieuDatCoc = 'PDC1000'
-- Exec LayDSThietBi
-- SELECT * FROM BIENBAN
-- SELECT * FROM  BIENBAN_THIETBI
-- DELETE FROM BIENBAN_THIETBI
-- DELETE FROM BIENBAN
-- select * from NV_QLY
-- SELECT * FROM NHANVIEN
-- SELECT * FROM HOPDONG
-- DELETE FROM HOPDONG WHERE MAPHIEUDATCOC = 'PDC069'


-- Tra PHONG sql
GO
CREATE OR ALTER PROCEDURE LayDSPDCDeTraPhong
AS
BEGIN
    SELECT
        PDC.MaPhieuDatCoc,
        ISNULL(HD.MaHopDong, N'Không có') AS MaHopDong,
        HD.NgayBatDau,
        HD.NgayKetThuc,
        KH.HoTen,
        PHONG.MaPhong -- Lấy mã phòng từ quan hệ CHITIETDATCOC -> GIUONG -> PHONG
    FROM PHIEUDATCOC PDC
    JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
    LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    LEFT JOIN CHITIETDATCOC CTDC ON CTDC.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    LEFT JOIN GIUONG G ON CTDC.MaGiuong = G.MaGiuong
    LEFT JOIN PHONG ON PHONG.MaPhong = G.MaPhong
    WHERE PDC.TrangThai <> N'Đã trả phòng'
END;

GO
EXEC LayDSPDCDeTraPhong;
GO

GO
CREATE OR ALTER PROCEDURE TaoPhieuTraPhong
    @MaPhieuDatCoc VARCHAR(50),
    @NgayTraPhong VARCHAR(20), -- Dùng VARCHAR để "lừa" driver Node.js như cách của bạn
    @MaNV VARCHAR(50)
AS
BEGIN
    -- 1. Validate
    IF NOT EXISTS (SELECT 1 FROM PHIEUDATCOC WHERE MaPhieuDatCoc = @MaPhieuDatCoc)
    BEGIN
        RAISERROR(N'Phiếu đặt cọc không tồn tại.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM NV_KDOANH WHERE MaNV = @MaNV)
    BEGIN
        RAISERROR(N'Nhân viên không thuộc bộ phận kinh doanh.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM PHIEUTRAPHONG WHERE MaPhieuDatCoc = @MaPhieuDatCoc)
    BEGIN
        RAISERROR(N'Phiếu đặt cọc này đã có phiếu trả phòng.', 16, 1);
        RETURN;
    END

    -- 2. Tạo mã phiếu trả phòng tự động
    DECLARE @MaPhieuTra VARCHAR(50);
    DECLARE @NextNum INT;

    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaPhieuTra, 4, 10) AS INT)), 0) + 1
    FROM PHIEUTRAPHONG;

    SET @MaPhieuTra = 'PTP' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    DECLARE @TinhTrangHD NVARCHAR(100);
    DECLARE @NgayKetThuc DATE;

    SELECT TOP 1 @NgayKetThuc = NgayKetThuc
    FROM HOPDONG
    WHERE MaPhieuDatCoc = @MaPhieuDatCoc;

    IF @NgayKetThuc IS NULL
    BEGIN
        SET @TinhTrangHD = N'Thanh lý đúng hạn';
    END
    ELSE IF CAST(@NgayTraPhong AS DATE) < @NgayKetThuc
    BEGIN
        SET @TinhTrangHD = N'Trước hạn';
    END
    ELSE IF CAST(@NgayTraPhong AS DATE) > @NgayKetThuc
    BEGIN
        SET @TinhTrangHD = N'Trễ hạn';
    END
    ELSE
    BEGIN
        SET @TinhTrangHD = N'Thanh lý đúng hạn';
    END

    -- =========================================================
    -- BẮT ĐẦU CẬP NHẬT DỮ LIỆU
    -- =========================================================

    -- A. Thêm dữ liệu vào PHIEUTRAPHONG
    INSERT INTO PHIEUTRAPHONG (MaPhieuTra, NgayTraPhong, TinhTrangHD, MaPhieuDatCoc, MaNV)
    VALUES (@MaPhieuTra, CAST(@NgayTraPhong AS DATE), @TinhTrangHD, @MaPhieuDatCoc, @MaNV);

    -- B. Cập nhật trạng thái phiếu đặt cọc
    UPDATE PHIEUDATCOC
    SET TrangThai = N'Đã trả phòng'
    WHERE MaPhieuDatCoc = @MaPhieuDatCoc;

    -- C. Giải phóng PHÒNG thành 'Trống'
    DECLARE @MaPhong VARCHAR(50);
    SELECT @MaPhong = MaPhong FROM PHIEUDATCOC WHERE MaPhieuDatCoc = @MaPhieuDatCoc;

    IF @MaPhong IS NOT NULL
    BEGIN
        UPDATE PHONG
        SET TrangThai = N'Trống'
        WHERE MaPhong = @MaPhong;
    END

    -- D. Giải phóng GIƯỜNG thành 'Trống' (Nếu khách cọc giường KTX)
    UPDATE GIUONG
    SET TrangThai = N'Trống'
    WHERE MaGiuong IN (
        SELECT MaGiuong FROM CHITIETDATCOC WHERE MaPhieuDatCoc = @MaPhieuDatCoc
    );

    -- Trả mã PTP về cho Node.js
    SELECT @MaPhieuTra AS MaPhieuTra;
END;
GO

-- ========================================================================
-- SP HOÀN CỌC KHI KHÁCH TỪ CHỐI KÝ HỢP ĐỒNG
-- ========================================================================
CREATE OR ALTER PROCEDURE HoanCocTuChoi
    @MaPhieuDatCoc VARCHAR(50),
    @NgayTraPhong VARCHAR(20),
    @MaNV VARCHAR(50)
AS
BEGIN
    -- 1. Validate
    IF NOT EXISTS (SELECT 1 FROM PHIEUDATCOC WHERE MaPhieuDatCoc = @MaPhieuDatCoc)
    BEGIN
        RAISERROR(N'Phiếu đặt cọc không tồn tại.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM NV_KDOANH WHERE MaNV = @MaNV)
    BEGIN
        RAISERROR(N'Nhân viên không thuộc bộ phận kinh doanh.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM PHIEUTRAPHONG WHERE MaPhieuDatCoc = @MaPhieuDatCoc)
    BEGIN
        RAISERROR(N'Phiếu đặt cọc này đã có phiếu trả phòng.', 16, 1);
        RETURN;
    END

    -- 2. Tạo mã phiếu trả phòng tự động
    DECLARE @MaPhieuTra VARCHAR(50);
    DECLARE @NextNum INT;

    SELECT @NextNum = ISNULL(MAX(CAST(SUBSTRING(MaPhieuTra, 4, 10) AS INT)), 0) + 1
    FROM PHIEUTRAPHONG;

    SET @MaPhieuTra = 'PTP' + RIGHT('000' + CAST(@NextNum AS VARCHAR(10)), 3);

    -- 3. Thêm vào PHIEUTRAPHONG với TinhTrangHD = 'Từ chối ký hợp đồng'
    INSERT INTO PHIEUTRAPHONG (MaPhieuTra, NgayTraPhong, TinhTrangHD, MaPhieuDatCoc, MaNV)
    VALUES (@MaPhieuTra, CAST(@NgayTraPhong AS DATE), N'Từ chối ký hợp đồng', @MaPhieuDatCoc, @MaNV);

    -- 4. Cập nhật trạng thái phiếu đặt cọc
    UPDATE PHIEUDATCOC
    SET TrangThai = N'Đã trả phòng'
    WHERE MaPhieuDatCoc = @MaPhieuDatCoc;

    -- 5. Giải phóng PHÒNG thành 'Trống'
    DECLARE @MaPhong VARCHAR(50);
    SELECT @MaPhong = MaPhong FROM PHIEUDATCOC WHERE MaPhieuDatCoc = @MaPhieuDatCoc;

    IF @MaPhong IS NOT NULL
    BEGIN
        UPDATE PHONG
        SET TrangThai = N'Trống'
        WHERE MaPhong = @MaPhong;
    END

    -- 6. Giải phóng GIƯỜNG thành 'Trống'
    UPDATE GIUONG
    SET TrangThai = N'Trống'
    WHERE MaGiuong IN (
        SELECT MaGiuong FROM CHITIETDATCOC WHERE MaPhieuDatCoc = @MaPhieuDatCoc
    );

    -- Trả mã PTP về cho Node.js
    SELECT @MaPhieuTra AS MaPhieuTra;
END;
GO
