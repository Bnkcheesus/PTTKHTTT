// src/pages/Sales/ThanhToanCoc.jsx

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SaleNavbar from '../../components/SaleNavbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ThanhToanCoc = () => {
    const navigate = useNavigate();

    const [cccd, setCccd] = useState('');
    const [duLieu, setDuLieu] = useState(null);
    const [dangTai, setDangTai] = useState(false);
    const [hinhThucThanhToan, setHinhThucThanhToan] = useState('Tiền mặt');
    const [thoiGianConLai, setThoiGianConLai] = useState('--');
    const [popup, setPopup] = useState(false);

    // State cho lịch hẹn
    const [ngayHen, setNgayHen] = useState('');
    const [gioHen, setGioHen] = useState('');

    // State thông báo (Floating Notification)
    const [thongBao, setThongBao] = useState({ hienThi: false, noiDung: '', loai: '' });

    // Tự động ẩn thông báo sau 3 giây
    useEffect(() => {
        if (thongBao.hienThi) {
            const timer = setTimeout(() => 
                setThongBao({ hienThi: false, noiDung: '', loai: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [thongBao.hienThi]);

    const FormatTien = (tien) => {
        if (!tien) return '0đ';
        return Number(tien).toLocaleString('vi-VN') + 'đ';
    };

    const TimKhachHang = async () => {
        if (!cccd.trim()) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng nhập số CCCD!', loai: 'error' });
            return;
        }

        try {
            setDangTai(true);
            const res = await axios.get(`http://localhost:5000/api/deposits/info/${cccd}`);
            setDuLieu(res.data);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Không tìm thấy thông tin đặt cọc.';
            setThongBao({ hienThi: true, noiDung: msg, loai: 'error' });
            setDuLieu(null);
        } finally {
            setDangTai(false);
        }
    };

    // Logic tính thời gian đếm ngược (24h từ lúc lập phiếu)
    useEffect(() => {
        if (!duLieu || duLieu.TrangThai !== 'Chưa thanh toán') return;

        const interval = setInterval(() => {
            const ngayLap = new Date(duLieu.NgayLap || new Date());
            const hanChot = new Date(ngayLap.getTime() + 24 * 60 * 60 * 1000);
            const hienTai = new Date();
            const diff = hanChot - hienTai;

            if (diff <= 0) {
                setThoiGianConLai('Hết hạn');
                clearInterval(interval);
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setThoiGianConLai(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [duLieu]);

    const GhiNhanThanhToan = async () => {
        try {
            if (thoiGianConLai === 'Hết hạn') {
                setThongBao({ hienThi: true, noiDung: 'Giao dịch thất bại: Đã quá hạn 24h thanh toán!', loai: 'error' });
                return;
            }

            await axios.post(`http://localhost:5000/api/deposits/record-payment`, {
                MaPhieuDatCoc: duLieu.MaPhieuDatCoc,
                HinhThucThanhToan: hinhThucThanhToan,
                MaPhong: duLieu.MaPhong,
                SoNguoi: duLieu.SoGiuongThue,
                HinhThucThue: duLieu.HinhThucThue // Gửi để backend kiểm tra khóa phòng
            });

            setThongBao({ hienThi: true, noiDung: 'Ghi nhận thanh toán cọc thành công!', loai: 'success' });
            setPopup(true); // Mở popup hẹn lịch nhận phòng
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.response?.data || 'Thanh toán thất bại';
            setThongBao({ hienThi: true, noiDung: 'Lỗi: ' + errorMsg, loai: 'error' });
        }
    };

    const XacNhanHen = async () => {
        if (!ngayHen || !gioHen) return;

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const currentMaNV = storedUser ? storedUser.MaNV : 'NV001'; // Mặc định NV001 nếu rỗng

            await axios.post(
                `http://localhost:5000/api/deposits/appointment`,
                {
                    // Quét toàn bộ vị trí có thể chứa MaPhieuYC, nếu không có thì gán 'PYC_TEST' để không bị chết server
                    MaPhieuYC: duLieu.MaPhieuYC || duLieu.phieuDatCoc?.MaPhieuYC || duLieu.phieuYeuCau?.MaPhieuYC || 'PYC_TEST', 
                    NgayHen: ngayHen,
                    GioHen: gioHen,
                    MaNV: currentMaNV
                }
            );

            setThongBao({ hienThi: true, noiDung: 'Xác nhận lịch hẹn thành công!', loai: 'success' });
            setPopup(false);
            TimKhachHang(); // Refresh lại dữ liệu để cập nhật trạng thái mới
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data || error.message || 'Không thể tạo lịch hẹn';
            setThongBao({ hienThi: true, noiDung: 'Lỗi lịch hẹn: ' + errorMsg, loai: 'error' });
        }
    };

    const InHoaDon = () => {
        const doc = new jsPDF();
        // Cấu hình font và nội dung hóa đơn tại đây...
        alert('Đang tạo và tải file PDF hóa đơn...');
    };

    const daThanhToan = duLieu?.TrangThai === 'Đã thanh toán' || duLieu?.TrangThai === 'Đã được chấp thuận';

    return (
        <div className="min-h-screen bg-white relative">
            {/* THÔNG BÁO NỔI */}
            {thongBao.hienThi && (
                <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-8 py-4 z-[10001] text-white font-bold shadow-2xl text-lg text-center rounded transition-all ${
                    thongBao.loai === 'success' ? 'bg-[#2A754B]' : 'bg-red-600'
                }`}>
                    {thongBao.noiDung}
                </div>
            )}

            <SaleNavbar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <h2 className="text-xl font-bold mb-4">Chọn một khách hàng để ghi nhận thanh toán</h2>
                <p className="text-gray-500 text-sm mb-4">(nhập số CCCD)</p>

                <div className="flex gap-3 mb-8">
                    <input
                        type="text"
                        value={cccd}
                        onChange={(e) => setCccd(e.target.value)}
                        placeholder="Nhập CCCD khách hàng..."
                        className="border border-gray-400 w-[300px] h-[45px] px-4 rounded outline-none"
                    />
                    <button
                        onClick={TimKhachHang}
                        disabled={dangTai}
                        className="bg-[#333] hover:bg-black text-white px-8 h-[45px] font-bold rounded"
                    >
                        Tìm
                    </button>
                </div>

                {duLieu && (
                    <div className="grid grid-cols-2 gap-10">
                        {/* Cột trái: Thông tin */}
                        <div className="space-y-6">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <DongThongTin label="Khách hàng" value={`${duLieu.MaKH} - ${duLieu.HoTen}`} />
                                    <DongThongTin label="Nhu cầu thuê" value={duLieu.HinhThucThue} />
                                    <DongThongTin label="Phòng" value={duLieu.MaPhong} />
                                    <DongThongTin label="Số giường thuê" value={duLieu.SoGiuongThue} />
                                </tbody>
                            </table>

                            <div>
                                <p className="text-lg font-bold">Mức tiền cọc:</p>
                                <p className="text-[#2A754B] text-4xl font-bold">{FormatTien(duLieu.TienCoc)}</p>
                            </div>

                            <div>
                                <p className="text-lg font-bold">Trạng thái:</p>
                                <p className={`text-xl font-bold ${daThanhToan ? 'text-green-600' : 'text-red-600'}`}>
                                    {duLieu.TrangThai}
                                </p>
                            </div>

                            {!daThanhToan && (
                                <div>
                                    <p className="text-lg font-bold">Thời gian còn lại:</p>
                                    <p className={`text-3xl font-bold ${thoiGianConLai === 'Hết hạn' ? 'text-red-600' : 'text-[#2A754B]'}`}>
                                        {thoiGianConLai}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Hình thức & Nút bấm */}
                        <div className="flex flex-col justify-between">
                            <div className="border border-gray-300 p-6 rounded bg-gray-50">
                                <h3 className="font-bold mb-4">Chọn hình thức thanh toán</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            checked={hinhThucThanhToan === 'Tiền mặt'}
                                            onChange={() => setHinhThucThanhToan('Tiền mặt')}
                                        />
                                        Tiền mặt
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            checked={hinhThucThanhToan === 'Chuyển khoản'}
                                            onChange={() => setHinhThucThanhToan('Chuyển khoản')}
                                        />
                                        Chuyển khoản
                                    </label>
                                </div>
                            </div>

                            {daThanhToan ? (
                                <button
                                    onClick={InHoaDon}
                                    className="bg-[#2A754B] hover:bg-green-800 text-white w-full py-5 text-xl font-bold rounded shadow-lg transition-all"
                                >
                                    In hoá đơn
                                </button>
                            ) : (
                                <button
                                    onClick={GhiNhanThanhToan}
                                    disabled={thoiGianConLai === 'Hết hạn'}
                                    className={`w-full py-5 text-xl font-bold text-white rounded shadow-lg transition-all ${
                                        thoiGianConLai === 'Hết hạn' ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#2A754B] hover:bg-green-800'
                                    }`}
                                >
                                    Ghi nhận thanh toán
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* POPUP HẸN LỊCH NHẬN PHÒNG */}
            {popup && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    {/* Lớp nền mờ trong suốt (Backdrop) */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                        onClick={() => setPopup(false)}
                    ></div>

                    {/* Nội dung Popup nổi lên trên */}
                    <div className="relative bg-white w-[500px] rounded-lg shadow-2xl overflow-hidden z-10">
                        <div className="bg-[#2A754B] text-white py-4 px-6 text-center font-bold text-lg">
                            Ghi nhận thanh toán cọc thành công!
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-bold mb-6">Hẹn nhận phòng:</h3>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block font-bold mb-2">Ngày hẹn*</label>
                                    <input 
                                        type="date" 
                                        className="w-full border border-gray-400 p-2 rounded"
                                        value={ngayHen}
                                        onChange={(e) => setNgayHen(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Giờ hẹn*</label>
                                    <input 
                                        type="time" 
                                        className="w-full border border-gray-400 p-2 rounded"
                                        value={gioHen}
                                        onChange={(e) => setGioHen(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setPopup(false)}
                                    className="bg-gray-400 text-white px-6 py-2 font-bold rounded hover:bg-gray-500"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={XacNhanHen}
                                    className="bg-black text-white px-10 py-2 font-bold rounded hover:bg-gray-800"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DongThongTin = ({ label, value }) => (
    <tr className="border border-gray-300">
        <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50 w-[220px]">{label}</td>
        <td className="border border-gray-300 px-3 py-2 text-sm">{value || '...'}</td>
    </tr>
);

export default ThanhToanCoc;