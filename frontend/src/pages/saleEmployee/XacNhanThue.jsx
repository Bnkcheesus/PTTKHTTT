// src/pages/Sales/XacNhanThue.jsx

import React, { useState } from 'react';
import axios from 'axios';
import SaleNavbar from '../../components/SaleNavbar';

const XacNhanThue = () => {
    const [cccd, setCccd] = useState('');
    const [duLieu, setDuLieu] = useState(null);
    const [dangTai, setDangTai] = useState(false);

    const [thongBao, setThongBao] = useState({
        hienThi: false,
        noiDung: '',
    });

    const TimKhachHang = async () => {
        if (!cccd.trim()) {
            alert('Vui lòng nhập CCCD');
            return;
        }

        try {
            setDangTai(true);

            // API backend:
            // tìm KH theo CCCD
            // lấy PHIEUYEUCAU có ThoiGianDuKien lớn nhất
            const response = await axios.get(
                `http://localhost:5000/api/xacnhanthue/${cccd}`
            );

            setDuLieu(response.data);
            console.log('Dữ liệu nhận được:', response.data); // Debug log
        } catch (error) {
            console.error(error);

            alert(error.response?.data?.error || 'Đã xảy ra lỗi');
            setDuLieu(null);
        } finally {
            setDangTai(false);
        }
    };

    const XacNhanThuePhong = async () => {
        try {
            await axios.post(
                `http://localhost:5000/api/xacnhanthue/confirm`,
                {
                    TienCoc: duLieu.phong.GiaThuePhong * 2,
                    MaKH: duLieu.khachHang.MaKH,
                    MaNV: null, // TODO: Lấy mã nhân viên từ context/auth
                    MaPhong: duLieu.phong.MaPhong,
                    MaPhieuYC: duLieu.phieuYeuCau.MaPhieuYC,
                }
            );

            setThongBao({
                hienThi: true,
                noiDung:
                    'Xác nhận thành công!\nThanh toán cọc mở trong 24 giờ.',
            });

            // load lại dữ liệu mới sau khi xác nhận
            setTimeout(() => {
                TimKhachHang();
            }, 1000);

            setTimeout(() => {
                setThongBao({
                    hienThi: false,
                    noiDung: '',
                });
            }, 3000);
        } catch (error) {
            console.error(error);
            alert('Xác nhận thất bại!');
        }
    };

    const FormatTien = (tien) => {
        if (!tien) return '0đ';

        return Number(tien).toLocaleString('vi-VN') + 'đ';
    };

    return (
    <div className="bg-white min-h-screen">
        <SaleNavbar />

        <div className="max-w-6xl mx-auto px-6 py-8 relative">
            {/* POPUP - Thu nhỏ từ 3xl xuống xl */}
            {thongBao.hienThi && (
                <div className="fixed top-1/2 left-1/2 z-[9999]
                    transform -translate-x-1/2 -translate-y-1/2
                    bg-[#2A754B] text-white
                    px-8 py-4
                    text-center
                    text-xl
                    font-bold
                    shadow-2xl rounded-lg"
                >
                    {thongBao.noiDung.split('\n').map((dong, index) => (
                        <div key={index}>{dong}</div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-10">
                {/* LEFT */}
                <div>
                    <h2 className="text-xl font-bold leading-tight">
                        Vui lòng chọn một khách hàng để xác nhận
                    </h2>

                    <p className="font-semibold text-sm text-gray-600 mb-4">
                        (nhập số CCCD)
                    </p>

                    {/* SEARCH - Giảm chiều cao từ 60px xuống 45px */}
                    <div className="flex items-center gap-3 mb-6">
                        <input
                            type="text"
                            value={cccd}
                            onChange={(e) => setCccd(e.target.value)}
                            placeholder="08388388381111111"
                            className="border border-gray-400
                            w-[300px]
                            h-[45px]
                            px-4
                            text-base
                            outline-none rounded"
                        />

                        <button
                            onClick={TimKhachHang}
                            disabled={dangTai}
                            className="bg-[#333333]
                            hover:bg-black
                            text-white
                            px-6
                            h-[45px]
                            text-base
                            font-bold
                            rounded
                            shadow-sm"
                        >
                            Tìm
                        </button>
                    </div>

                    {/* INFO */}
                    {duLieu && (
                        <div className="space-y-6">
                            {/* KHACH HANG */}
                            <table className="w-full border-collapse">
                                <tbody>
                                    <DongThongTin
                                        label="Khách hàng"
                                        value={`${duLieu.khachHang.MaKH} - ${duLieu.khachHang.HoTen}`}
                                    />
                                    <DongThongTin label="CCCD" value={duLieu.khachHang.CCCD} />
                                    <DongThongTin label="Giới tính" value={duLieu.khachHang.GioiTinh} />
                                    <DongThongTin label="Số điện thoại" value={duLieu.khachHang.SDT} />
                                    <DongThongTin label="Email" value={duLieu.khachHang.Email} />
                                    <DongThongTin label="Ngày ở dự kiến" value={duLieu.phieuYeuCau.ThoiGianDuKien} />
                                </tbody>
                            </table>

                            {/* PHONG */}
                            <table className="w-full border-collapse">
                                <tbody>
                                    <DongThongTin label="Nhu cầu thuê" value={duLieu.phieuYeuCau.HinhThucThue} />
                                    <DongThongTin label="Phòng" value={duLieu.phong.MaPhong} />
                                    <DongThongTin label="Loại phòng" value={duLieu.phong.TenLoai} />
                                    <DongThongTin label="Số người tối đa" value={duLieu.phong.SoNguoiThueToiDa} />
                                    <DongThongTin label="Số người dự kiến" value={duLieu.phieuYeuCau.SoNguoiDuKien} />
                                    <DongThongTin label="Khu vực" value={duLieu.phong.TenKhuVuc} />
                                    <DongThongTin label="Địa chỉ" value={duLieu.phong.DiaChi} />
                                    
                                    <tr className="border border-gray-300">
                                        <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50 w-[160px]">
                                            Tình trạng phòng
                                        </td>
                                        <td className={`border border-gray-300 px-3 py-2 text-sm ${
                                            duLieu.phong.TrangThai === 'Trống' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
                                        }`}>
                                            {duLieu.phong.TrangThai}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div>
                    {duLieu && (
                        <>
                            {/* Tien coc */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-lg font-bold mb-1">Mức tiền cọc:</p>
                                    <p className="text-[#2A754B] text-3xl font-bold">
                                        {FormatTien(duLieu.phong.GiaThuePhong * 2)}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-bold mb-1">Trạng thái:</p>
                                    <div className="text-xl font-bold whitespace-pre-line">
                                        {duLieu.trangThaiPYC}
                                    </div>
                                </div>
                            </div>

                            {/* NOI QUY */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold mb-2">Nội quy chỗ ở:</h3>
                                <div className="border border-gray-300 bg-gray-50 h-[300px] overflow-y-auto p-4 text-sm text-gray-700 whitespace-pre-line rounded">
                                    {duLieu.phong.DieuKienChoThue}
                                </div>
                            </div>

                            {/* BUTTON */}
                            <button
                                onClick={XacNhanThuePhong}
                                disabled={
                                    duLieu.trangThaiPYC.includes('Đã xác nhận') ||
                                    duLieu.phong.TrangThai !== 'Trống'
                                }
                                className={`w-full py-4 text-lg font-bold text-white transition-all shadow-sm rounded-md ${
                                    duLieu.trangThaiPYC.includes('Đã xác nhận') || duLieu.phong.TrangThai !== 'Trống'
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#2A754B] hover:bg-green-800'
                                }`}
                            >
                                Xác nhận đồng ý thuê & đặt cọc
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

// Component con được tinh chỉnh kích thước chữ
const DongThongTin = ({ label, value }) => {
    return (
        <tr className="border border-gray-300">
            <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50 w-[160px]">
                {label}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">
                {value || '...'}
            </td>
        </tr>
    );
};

export default XacNhanThue;