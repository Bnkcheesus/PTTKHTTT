USE QUANLYKHACHSAN
GO

-- Lấy thông tin phiếu đặt cọc gần nhất của một khách hàng
CREATE OR ALTER PROCEDURE LayThongTinPhieuDatCocMoiNhat_MaKH
    @MaKH VARCHAR(50)
AS
BEGIN
    SELECT TOP 1 *
    FROM PHIEUDATCOC
    WHERE MaKH = @MaKH
    ORDER BY NgayLap DESC;
END
GO

-- Cập nhật phiếu đặt cọc sau khi đã thanh toán
CREATE OR ALTER PROCEDURE CapNhatPDC_DaThanhToan
	@MaPDC VARCHAR(50),
	@HinhThucThanhToan NVARCHAR(20)
AS	
BEGIN
	UPDATE PHIEUDATCOC
	SET TrangThai = N'Đã thanh toán', HinhThucThanhToan = @HinhThucThanhToan
	WHERE MaPhieuDatCoc = @MaPDC
END
GO

-- Lấy danh sách thông tin giường của một phiếu đặt cọc cụ thể
CREATE OR ALTER PROCEDURE LayThongTinGiuong_ChiTietDatCoc
    @MaPDC VARCHAR(50)
AS
BEGIN
    SELECT CT.MaGiuong, MaPhong, GiaThue, TrangThai
	FROM CHITIETDATCOC CT
	JOIN GIUONG G
	ON CT.MaGiuong = G.MaGiuong
	WHERE MaPhieuDatCoc = @MaPDC;
END
GO

-- Lấy danh sách giường còn trống của một phòng
CREATE OR ALTER PROCEDURE LayThongTinGiuongConTrong_Phong
	@MaPhong VARCHAR(50)
AS
BEGIN
	SELECT MaGiuong
            FROM GIUONG
            WHERE MaPhong = @MaPhong AND TrangThai = N'Trống'
END
GO


-- Cập nhật trạng thái của một giường
CREATE OR ALTER PROCEDURE CapNhatTrangThaiGiuong
    @MaGiuong VARCHAR(50),
    @TT NVARCHAR(50)
AS
BEGIN
    UPDATE GIUONG
    SET TrangThai = @TT
    WHERE MaGiuong = @MaGiuong
END
GO


