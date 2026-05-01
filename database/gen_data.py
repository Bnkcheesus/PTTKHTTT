import random
import unicodedata
from datetime import datetime, timedelta

# ==========================================
# 1. TỪ ĐIỂN DỮ LIỆU (DICTIONARIES)
# ==========================================

HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý']
DEM_NAM = ['Văn', 'Hữu', 'Công', 'Minh', 'Đức', 'Quốc', 'Đình', 'Xuân', 'Ngọc', 'Hoàng', 'Thanh', 'Gia']
TEN_NAM = ['Hùng', 'Dũng', 'Cường', 'Hải', 'Phát', 'Đạt', 'Thành', 'Kiên', 'Tuấn', 'Phong', 'Long', 'Nam', 'Việt', 'Khoa', 'Khang', 'Bảo']
DEM_NU = ['Thị', 'Ngọc', 'Thu', 'Phương', 'Thanh', 'Hồng', 'Mỹ', 'Như', 'Diễm', 'Bích', 'Kim', 'Hoàng']
TEN_NU = ['Hoa', 'Lan', 'Mai', 'Hương', 'Trà', 'Linh', 'Trang', 'Nga', 'Nhung', 'Thảo', 'Hà', 'Giang', 'Thủy', 'Vy', 'Trâm', 'Anh']

DUONG = ['Nguyễn Trãi', 'Lê Lợi', 'Điện Biên Phủ', 'Nguyễn Đình Chiểu', 'Cách Mạng Tháng 8', 'Hùng Vương', 'Võ Văn Kiệt', 'Nguyễn Văn Cừ', 'Pasteur', 'Lý Tự Trọng', 'Trần Hưng Đạo', 'Phạm Ngũ Lão']
PHUONG = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường Bến Nghé', 'Phường Đa Kao', 'Phường Linh Trung', 'Phường Tân Định']
QUAN = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Quận Tân Bình', 'Quận Bình Thạnh', 'TP. Thủ Đức', 'Quận 7']
THANH_PHO = 'TP. Hồ Chí Minh'

# ==========================================
# 2. CÁC HÀM SINH DỮ LIỆU NGẪU NHIÊN
# ==========================================

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)]).replace('đ', 'd').replace('Đ', 'D')

def generate_name(gender):
    ho = random.choice(HO)
    if gender == 'Nam':
        dem = random.choice(DEM_NAM)
        ten = random.choice(TEN_NAM)
    else:
        dem = random.choice(DEM_NU)
        ten = random.choice(TEN_NU)
    return f"{ho} {dem} {ten}", ten

def generate_address():
    so_nha = f"{random.randint(1, 999)}{random.choice(['', 'A', 'B', '/12', '/5'])}"
    return f"{so_nha} {random.choice(DUONG)}, {random.choice(PHUONG)}, {random.choice(QUAN)}, {THANH_PHO}"

def generate_phone():
    prefix = random.choice(['09', '03', '08', '07'])
    suffix = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{suffix}"

def generate_cccd():
    return "0" + ''.join([str(random.randint(0, 9)) for _ in range(11)])

def escape(text):
    if text is None: return "NULL"
    return f"N'{str(text).replace(chr(39), chr(39)+chr(39))}'"

def random_date(start_year=2023, end_year=2024):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randrange(delta.days)
    return start + timedelta(days=random_days)

# ==========================================
# 3. HÀM TẠO SCRIPT SQL (QUY MÔ LỚN)
# ==========================================

def generate_sql():
    output_file = '2_data.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("USE QUANLYKHACHSAN;\nGO\n\n")

        # --- Bảng KHUVUC & LOAIPHONG ---
        khuvuc_ids = ['KV01', 'KV02', 'KV03']
        f.write("-- Bảng KHUVUC\n")
        khuvuc_names = ['Cơ sở Quận 1 - Trung Tâm', 'Cơ sở Bình Thạnh - ĐH KHTN', 'Cơ sở Quận 7 - Nam Sài Gòn']
        for i in range(3): f.write(f"INSERT INTO KHUVUC (MaKV, TenKhuVuc, DiaChi) VALUES ('{khuvuc_ids[i]}', {escape(khuvuc_names[i])}, {escape(generate_address())});\n")
        
        loaiphong_ids = ['LP_VIP', 'LP_THUONG', 'LP_KTX']
        f.write("\n-- Bảng LOAIPHONG\n")
        loaiphong_names = ['Phòng VIP Nguyên Căn', 'Phòng Tiêu Chuẩn', 'Phòng KTX Ở Ghép']
        for i in range(3): f.write(f"INSERT INTO LOAIPHONG (MaLoai, TenLoai) VALUES ('{loaiphong_ids[i]}', {escape(loaiphong_names[i])});\n")

        # --- Bảng THIETBI ---
        thietbi_ids = [f'TB{str(i).zfill(2)}' for i in range(1, 6)]
        f.write("\n-- Bảng THIETBI\n")
        thietbi_names = ['Máy lạnh Daikin 1HP', 'Tủ lạnh Panasonic 180L', 'Giường tầng sắt Hòa Phát', 'Tủ quần áo gỗ MDF', 'Quạt trần Panasonic']
        for i in range(5): f.write(f"INSERT INTO THIETBI (MaThietBi, TenThietBi, GiaTienBoiThuong) VALUES ('{thietbi_ids[i]}', {escape(thietbi_names[i])}, {random.randint(5, 80) * 100000});\n")

        # --- Bảng NHANVIEN (15 NV) ---
        nv_ids = [f'NV{str(i).zfill(3)}' for i in range(1, 16)]
        nv_kdoanh, nv_qly, nv_ktoan = nv_ids[0:5], nv_ids[5:10], nv_ids[10:15]

        f.write("\n-- Bảng NHANVIEN\n")
        for nv in nv_ids:
            ho_ten_nv, _ = generate_name(random.choice(['Nam', 'Nữ']))
            f.write(f"INSERT INTO NHANVIEN (MaNV, TenNV) VALUES ('{nv}', {escape(ho_ten_nv)});\n")

        f.write("\n-- Phân quyền Nhân viên\n")
        for nv in nv_kdoanh: f.write(f"INSERT INTO NV_KDOANH (MaNV) VALUES ('{nv}');\n")
        for nv in nv_qly: f.write(f"INSERT INTO NV_QLY (MaNV) VALUES ('{nv}');\n")
        for nv in nv_ktoan: f.write(f"INSERT INTO NV_KTOAN (MaNV) VALUES ('{nv}');\n")

        # --- Bảng KHACHHANG (100 KHÁCH HÀNG) ---
        kh_ids = [f'KH{str(i).zfill(3)}' for i in range(1, 101)]
        f.write("\n-- Bảng KHACHHANG (100 rows)\n")
        for kh in kh_ids:
            gioi_tinh = random.choice(['Nam', 'Nữ'])
            ho_ten, ten_ngan = generate_name(gioi_tinh)
            email = f"{remove_accents(ten_ngan).lower()}{random.randint(1990, 2005)}@gmail.com"
            f.write(f"INSERT INTO KHACHHANG (MaKH, HoTen, SDT, Email, GioiTinh, CCCD) VALUES ('{kh}', {escape(ho_ten)}, '{generate_phone()}', '{email}', N'{gioi_tinh}', '{generate_cccd()}');\n")

        # --- Bảng NHOMTHUE (15 NHÓM) ---
        nhom_ids = [f'NHOM{str(i).zfill(2)}' for i in range(1, 16)]
        f.write("\n-- Bảng NHOMTHUE\n")
        for nhom in nhom_ids: f.write(f"INSERT INTO NHOMTHUE (MaNhom, MaKHDaiDien) VALUES ('{nhom}', '{random.choice(kh_ids)}');\n")

        f.write("\n-- Bảng CHITIET_NHOMTHUE\n")
        for nhom in nhom_ids:
            for mem in random.sample(kh_ids, random.randint(2, 4)):
                f.write(f"INSERT INTO CHITIET_NHOMTHUE (MaNhom, MaKH) VALUES ('{nhom}', '{mem}');\n")

        # --- Bảng PHONG (30 PHÒNG) & GIUONG (Khoảng 90 GIƯỜNG) ---
        phong_ids = [f'P{str(i).zfill(3)}' for i in range(1, 31)]
        f.write("\n-- Bảng PHONG (30 rows)\n")
        for p in phong_ids:
            f.write(f"INSERT INTO PHONG (MaPhong, SoNguoiThueToiDa, GiaThuePhong, TrangThai, DieuKienChoThue, MaKV, MaLoai) VALUES ('{p}', {random.choice([2, 4, 6])}, {random.randint(20, 60)*100000}, N'{random.choice(['Trống', 'Đã cho thuê'])}', N'Cam kết không ồn ào', '{random.choice(khuvuc_ids)}', '{random.choice(loaiphong_ids)}');\n")

        giuong_ids = []
        f.write("\n-- Bảng GIUONG\n")
        for p in phong_ids:
            for j in range(1, random.randint(2, 4) + 1):
                g_id = f"{p}_G{j}"
                giuong_ids.append(g_id)
                f.write(f"INSERT INTO GIUONG (MaGiuong, GiaThue, TrangThai, MaPhong) VALUES ('{g_id}', {random.randint(12, 18)*100000}, N'{random.choice(['Trống', 'Đã có người'])}', '{p}');\n")

        # --- Bảng PHIEUYEUCAU & LICHHEN (80 YÊU CẦU) ---
        pyc_ids = [f'PYC{str(i).zfill(3)}' for i in range(1, 81)]
        f.write("\n-- Bảng PHIEUYEUCAU (80 rows)\n")
        for pyc in pyc_ids:
            f.write(f"INSERT INTO PHIEUYEUCAU (MaPhieuYC, SoNguoiDuKien, KhoangGia, ThoiGianDuKien, GhiChu, HinhThucThue, MaKH, MaKV, MaLoai) VALUES ('{pyc}', {random.randint(1, 4)}, {random.randint(20, 50)*100000}, N'Thuê 6 tháng', N'', N'{random.choice(['Thuê nguyên phòng', 'Ở ghép'])}', '{random.choice(kh_ids)}', '{random.choice(khuvuc_ids)}', '{random.choice(loaiphong_ids)}');\n")

        f.write("\n-- Bảng LICHHEN (80 rows)\n")
        for i, pyc in enumerate(pyc_ids):
            f.write(f"INSERT INTO LICHHEN (MaLH, ThoiGian, LyDo, MaPhieuYC, MaNV) VALUES ('LH{str(i+1).zfill(3)}', '{random_date().strftime('%Y-%m-%d %H:%M:%S')}', N'Xem phòng', '{pyc}', '{random.choice(nv_kdoanh)}');\n")

        # --- GIAO DỊCH (70 CỌC -> 60 HỢP ĐỒNG -> 50 TRẢ PHÒNG -> 50 HÓA ĐƠN) ---
        pdc_ids = [f'PDC{str(i).zfill(3)}' for i in range(1, 71)]
        f.write("\n-- Bảng PHIEUDATCOC (70 rows)\n")
        for pdc in pdc_ids:
            f.write(f"INSERT INTO PHIEUDATCOC (MaPhieuDatCoc, NgayLap, LoaiDatCoc, TrangThai, TienCoc, MaKH, MaNV) VALUES ('{pdc}', '{random_date(2023, 2024).strftime('%Y-%m-%d')}', N'Cọc giữ chỗ', N'Đã thanh toán', {random.randint(24, 36)*100000}, '{random.choice(kh_ids)}', '{random.choice(nv_kdoanh)}');\n")

        f.write("\n-- Bảng CHITIETDATCOC\n")
        for pdc in pdc_ids:
            try: f.write(f"INSERT INTO CHITIETDATCOC (MaPhieuDatCoc, MaGiuong) VALUES ('{pdc}', '{random.choice(giuong_ids)}');\n")
            except: pass

        hd_ids = [f'HD{str(i).zfill(3)}' for i in range(1, 61)]
        f.write("\n-- Bảng HOPDONG (60 rows)\n")
        for i, hd in enumerate(hd_ids):
            ngayky = random_date(2023, 2023)
            f.write(f"INSERT INTO HOPDONG (MaHopDong, NgayKy, NgayBatDau, NgayKetThuc, NoiDungHD, MaPhieuDatCoc, MaNV) VALUES ('{hd}', '{ngayky.strftime('%Y-%m-%d')}', '{(ngayky + timedelta(days=2)).strftime('%Y-%m-%d')}', '{(ngayky + timedelta(days=180)).strftime('%Y-%m-%d')}', N'Đóng tiền từ ngày 1-5 hàng tháng.', '{pdc_ids[i]}', '{random.choice(nv_kdoanh)}');\n")

        ptp_ids = [f'PTP{str(i).zfill(3)}' for i in range(1, 51)]
        f.write("\n-- Bảng PHIEUTRAPHONG (50 rows)\n")
        for i, ptp in enumerate(ptp_ids):
            f.write(f"INSERT INTO PHIEUTRAPHONG (MaPhieuTra, NgayTraPhong, TinhTrangHD, MaPhieuDatCoc, MaNV) VALUES ('{ptp}', '{random_date(2024, 2024).strftime('%Y-%m-%d')}', N'{random.choice(['Thanh lý đúng hạn', 'Trước hạn'])}', '{pdc_ids[i]}', '{random.choice(nv_kdoanh)}');\n")

        f.write("\n-- Bảng PHIEUKIEMTRA & CHITIETKIEMTRA (50 rows)\n")
        for i, ptp in enumerate(ptp_ids):
            pkt = f'PKT{str(i+1).zfill(3)}'
            f.write(f"INSERT INTO PHIEUKIEMTRA (MaPhieuKiemTra, SoDienDung, SoNuocDung, MaPhieuTra, MaNV) VALUES ('{pkt}', {round(random.uniform(80, 150), 1)}, {round(random.uniform(5, 12), 1)}, '{ptp}', '{random.choice(nv_qly)}');\n")
            f.write(f"INSERT INTO CHITIETKIEMTRA (MaPhieuKiemTra, MaThietBi, SoLuongHuHong) VALUES ('{pkt}', '{random.choice(thietbi_ids)}', {random.choice([0, 1])});\n")

        f.write("\n-- Bảng BANGDOISOAT & CHITIETKHAUTRU (50 rows)\n")
        for i, ptp in enumerate(ptp_ids):
            bds = f'BDS{str(i+1).zfill(3)}'
            f.write(f"INSERT INTO BANGDOISOAT (MaBang, TyLeHoanCoc, SoTienHoanCoc, TongKhauTru, MaPhieuTra) VALUES ('{bds}', {random.choice([0.5, 0.7, 0.8, 1.0])}, {random.randint(15, 30)*100000}, {random.randint(0, 5)*100000}, '{ptp}');\n")
            f.write(f"INSERT INTO CHITIETKHAUTRU (MaKhauTru, TenKhoan, SoTien, MaBang) VALUES ('CKT{str(i+1).zfill(3)}', N'Phí vệ sinh phòng', {random.randint(1, 3)*100000}, '{bds}');\n")

        f.write("\n-- Bảng HOADON (50 rows)\n")
        for i, ptp in enumerate(ptp_ids):
            f.write(f"INSERT INTO HOADON (MaHD, LoaiHoaDon, SoTien, NgayThanhToan, MaPhieuTra) VALUES ('HDON{str(i+1).zfill(3)}', N'Thanh toán đợt cuối', {random.randint(3, 10)*100000}, '{random_date(2024, 2024).strftime('%Y-%m-%d')}', '{ptp}');\n")

    print(f"Đã tạo thành công file {output_file} với 50 Hóa Đơn và quy mô dữ liệu lớn!")

if __name__ == '__main__':
    generate_sql()