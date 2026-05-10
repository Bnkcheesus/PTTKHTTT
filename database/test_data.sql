-- Thêm dữ liệu test cho tính năng Trả Phòng
-- Thêm phiếu đặt cọc mới chưa có phiếu trả phòng

-- Thêm 5 phiếu đặt cọc mới (PDC061 - PDC065)
INSERT INTO PHIEUDATCOC (MaPhieuDatCoc, NgayDatCoc, SoTienDatCoc, MaKH, MaNV) VALUES
('PDC061', '2024-01-15', 3000000, 'KH001', 'NV002'),
('PDC062', '2024-02-20', 2500000, 'KH002', 'NV001'),
('PDC063', '2024-03-10', 4000000, 'KH003', 'NV003'),
('PDC064', '2024-04-05', 3500000, 'KH004', 'NV002'),
('PDC065', '2024-05-12', 2800000, 'KH005', 'NV001');

-- Thêm chi tiết đặt cọc cho các phiếu mới
INSERT INTO CHITIETDATCOC (MaPhieuDatCoc, MaGiuong) VALUES
('PDC061', 'P001_G1'),
('PDC062', 'P002_G2'),
('PDC063', 'P003_G3'),
('PDC064', 'P004_G1'),
('PDC065', 'P005_G2');

-- Thêm hợp đồng cho các phiếu đặt cọc mới
INSERT INTO HOPDONG (MaHopDong, NgayKy, NgayBatDau, NgayKetThuc, NoiDungHD, MaPhieuDatCoc, MaNV) VALUES
('HD061', '2024-01-16', '2024-01-18', '2024-07-15', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC061', 'NV002'),
('HD062', '2024-02-21', '2024-02-23', '2024-08-20', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC062', 'NV001'),
('HD063', '2024-03-11', '2024-03-13', '2024-09-10', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC063', 'NV003'),
('HD064', '2024-04-06', '2024-04-08', '2024-10-05', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC064', 'NV002'),
('HD065', '2024-05-13', '2024-05-15', '2024-11-12', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC065', 'NV001');

-- Thêm một số phiếu đặt cọc với hợp đồng đã hết hạn để test trường hợp "Từ chối"
INSERT INTO PHIEUDATCOC (MaPhieuDatCoc, NgayDatCoc, SoTienDatCoc, MaKH, MaNV) VALUES
('PDC066', '2023-06-01', 3000000, 'KH006', 'NV003'),
('PDC067', '2023-07-15', 2500000, 'KH007', 'NV002');

INSERT INTO CHITIETDATCOC (MaPhieuDatCoc, MaGiuong) VALUES
('PDC066', 'P006_G1'),
('PDC067', 'P007_G2');

INSERT INTO HOPDONG (MaHopDong, NgayKy, NgayBatDau, NgayKetThuc, NoiDungHD, MaPhieuDatCoc, MaNV) VALUES
('HD066', '2023-06-02', '2023-06-04', '2023-12-01', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC066', 'NV003'),
('HD067', '2023-07-16', '2023-07-18', '2024-01-15', N'Đóng tiền từ ngày 1-5 hàng tháng.', 'PDC067', 'NV002');