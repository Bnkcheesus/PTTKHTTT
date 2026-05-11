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

    const [hinhThucThanhToan, setHinhThucThanhToan] =
        useState('Tiền mặt');

    const [thoiGianConLai, setThoiGianConLai] = useState('--');

    const [popup, setPopup] = useState(false);

    const [ngayHen, setNgayHen] = useState('');
    const [gioHen, setGioHen] = useState('');

    // ==========================
    // FORMAT TIỀN
    // ==========================
    const FormatTien = (tien) => {
        if (!tien) return '0đ';

        return Number(tien).toLocaleString('vi-VN') + 'đ';
    };

    // ==========================
    // TÌM KHÁCH HÀNG
    // ==========================
    const TimKhachHang = async () => {
        if (!cccd.trim()) {
            alert('Vui lòng nhập CCCD');
            return;
        }

        try {
            setDangTai(true);

            const response = await axios.get(
                `http://localhost:5000/api/deposits/${cccd}`
            );

            setDuLieu(response.data);

            // nếu đã có thanh toán
            if (
                response.data?.phieuDatCoc?.HinhThucThanhToan
            ) {
                setHinhThucThanhToan(
                    response.data.phieuDatCoc.HinhThucThanhToan
                );
            } else {
                setHinhThucThanhToan('Tiền mặt');
            }
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.error ||
                    'Không tìm thấy khách hàng'
            );

            setDuLieu(null);
        } finally {
            setDangTai(false);
        }
    };

    // ==========================
    // ĐẾM NGƯỢC
    // ==========================
    useEffect(() => {
        if (!duLieu?.phieuDatCoc) {
            setThoiGianConLai('--');
            return;
        }

        // đã thanh toán
        if (
            duLieu.phieuDatCoc.TrangThai ===
            'Đã thanh toán'
        ) {
            setThoiGianConLai('--');
            return;
        }

        const interval = setInterval(() => {
            const ngayLap = new Date(
                duLieu.phieuDatCoc.NgayLap
            );

            // hạn là 23:59 ngày hôm sau
            const han = new Date(ngayLap);

            han.setDate(han.getDate() + 1);

            han.setHours(23, 59, 59, 999);

            const now = new Date();

            const diff = han - now;

            if (diff <= 0) {
                setThoiGianConLai('Hết hạn');
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(
                diff / (1000 * 60 * 60)
            );

            const minutes = Math.floor(
                (diff % (1000 * 60 * 60)) /
                    (1000 * 60)
            );

            const seconds = Math.floor(
                (diff % (1000 * 60)) / 1000
            );

            setThoiGianConLai(
                `${String(hours).padStart(2, '0')}:${String(
                    minutes
                ).padStart(2, '0')}:${String(seconds).padStart(
                    2,
                    '0'
                )}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [duLieu]);

    // ==========================
    // GHI NHẬN THANH TOÁN
    // ==========================
    const GhiNhanThanhToan = async () => {
        try {
            // nếu hết hạn thì không cho ghi nhận thanh toán
            if (thoiGianConLai === 'Hết hạn') {
                alert('Đã hết hạn thanh toán cọc');
                return;
            }
            await axios.post(
                `http://localhost:5000/api/deposits/record-payment`,
                {
                    MaPhieuDatCoc:
                        duLieu.phieuDatCoc.MaPhieuDatCoc,

                    HinhThucThanhToan:
                        hinhThucThanhToan,

                    MaPhong:
                        duLieu.phong.MaPhong,

                    SoNguoi:
                        duLieu.phieuYeuCau.SoNguoiDuKien
                }
            );

            setPopup(true);
        } catch (error) {
            console.error(error);

            alert('Thanh toán thất bại');
        }
    };

    // ==========================
    // XÁC NHẬN HẸN
    // ==========================
    const XacNhanHen = async () => {
        if (!ngayHen || !gioHen) return;

        try {
            await axios.post(
                `http://localhost:5000/api/deposits/appointment`,
                {
                    MaPhieuYC: duLieu.phieuYeuCau.MaPhieuYC,
                    NgayHen: ngayHen,
                    GioHen: gioHen,
                }
            );

            alert('Xác nhận hẹn thành công!');
            TimKhachHang();
        } catch (error) {
            console.error(error);

            alert('Xác nhận thất bại');
        }
    };

    // ==========================
    // PDF
    // ==========================
    const InHoaDon = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);

        doc.text('HOA DON DAT COC', 70, 20);

        autoTable(doc, {
            startY: 35,
            body: [
                [
                    'Ma phieu dat coc',
                    duLieu.phieuDatCoc.MaPhieuDatCoc,
                ],
                [
                    'Khach hang',
                    duLieu.khachHang.HoTen,
                ],
                [
                    'CCCD',
                    duLieu.khachHang.CCCD,
                ],
                [
                    'Phong',
                    duLieu.phong.MaPhong,
                ],
                [
                    'Tien coc',
                    FormatTien(
                        duLieu.phieuDatCoc.TienCoc
                    ),
                ],
                [
                    'Hinh thuc thanh toan',
                    duLieu.phieuDatCoc.HinhThucThanhToan,
                ],
                [
                    'Ngay lap',
                    duLieu.phieuDatCoc.NgayLap,
                ],
                [
                    'Trang thai',
                    duLieu.phieuDatCoc.TrangThai,
                ],
            ],
        });

        doc.save(
            `${duLieu.phieuDatCoc.MaPhieuDatCoc}.pdf`
        );
    };

    // ==========================
    // CHECK
    // ==========================
    const daThanhToan =
        duLieu?.phieuDatCoc?.TrangThai ===
        'Đã thanh toán';

    return (
    <div className="min-h-screen">
        <SaleNavbar />

        <div className="max-w-7xl mx-auto px-8 py-6 relative">

            {/* ================= POPUP ================= */}
            {popup && (
                <div className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center">
                    <div className="bg-white w-[620px] shadow-2xl border relative rounded">

                        {/* HEADER */}
                        <div className="bg-[#2A754B] text-white text-2xl font-bold text-center py-6 rounded-t">
                            Ghi nhận thanh toán cọc thành công!
                        </div>

                        {/* BODY */}
                        <div className="p-10">

                            <div className="mb-8">
                                <p className="text-2xl font-bold mb-4">
                                    Hẹn nhận phòng:
                                </p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xl font-bold mb-2">
                                            Ngày hẹn*
                                        </label>

                                        <input
                                            type="date"
                                            value={ngayHen}
                                            onChange={(e) =>
                                                setNgayHen(e.target.value)
                                            }
                                            className="w-full border border-gray-400 h-[55px] px-4 text-xl rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xl font-bold mb-2">
                                            Giờ hẹn*
                                        </label>

                                        <input
                                            type="time"
                                            value={gioHen}
                                            onChange={(e) =>
                                                setGioHen(e.target.value)
                                            }
                                            className="w-full border border-gray-400 h-[55px] px-4 text-xl rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    disabled={!ngayHen || !gioHen}
                                    onClick={XacNhanHen}
                                    className={`px-10 h-[55px] text-xl font-bold text-white rounded ${
                                        !ngayHen || !gioHen
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#333333] hover:bg-black'
                                    }`}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB ================= */}
            <div className="flex justify-end mb-5">
                <div className="flex border border-gray-500 overflow-hidden rounded">

                    <button
                        className="w-[180px] h-[50px] bg-black text-white text-xl font-bold"
                    >
                        Thuê
                    </button>

                    <button
                        onClick={() => navigate('/thanhly')}
                        className="w-[180px] h-[50px] bg-white text-black text-xl"
                    >
                        Thanh lý
                    </button>
                </div>
            </div>

            {/* ================= SEARCH ================= */}
            <div className="mb-6">

                <h2 className="text-xl font-bold leading-tight">
                    Chọn một khách hàng để ghi nhận thanh toán
                </h2>

                <p className="font-semibold text-lg text-gray-700 mb-4">
                    (nhập số CCCD)
                </p>

                <div className="flex gap-4">

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
            </div>

            {/* ================= DATA ================= */}
            {duLieu && (
                <div className="grid grid-cols-2 gap-8">

                    {/* LEFT */}
                    <div>

                        <table className="w-full border-collapse mb-8">
                            <tbody>

                                <DongThongTin
                                    label="Khách hàng"
                                    value={`${duLieu.khachHang.MaKH} - ${duLieu.khachHang.HoTen}`}
                                />

                                <DongThongTin
                                    label="Nhu cầu thuê"
                                    value={duLieu.phieuYeuCau.HinhThucThue}
                                />

                                <DongThongTin
                                    label="Phòng"
                                    value={duLieu.phong.MaPhong}
                                />

                                <DongThongTin
                                    label="Số giường"
                                    value={duLieu.phong.SoNguoiThueToiDa}
                                />

                                <tr className="border border-gray-300">
                                    <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50 w-[220px]">
                                        Tình trạng phòng
                                    </td>

                                    <td className="border border-gray-300 px-3 py-2 text-sm font-bold text-green-600">
                                        {duLieu.phong.TrangThai}
                                    </td>
                                </tr>

                            </tbody>
                        </table>

                        {/* TIỀN */}
                        <div className="mb-6">
                            <p className="text-xl font-bold mb-2">
                                Mức tiền cọc:
                            </p>

                            {duLieu.phieuDatCoc ? (
                                <p className="text-[#2A754B] text-3xl font-bold">
                                    {FormatTien(
                                        duLieu.phieuDatCoc.TienCoc
                                    )}
                                </p>
                            ) : (
                                <p className="text-[#2A754B] text-3xl font-bold">
                                    {FormatTien(
                                        duLieu.phong.GiaThuePhong * 2
                                    )}
                                </p>
                            )}
                        </div>

                        {/* STATUS */}
                        <div className="mb-6">
                            <p className="text-xl font-bold mb-2">
                                Trạng thái:
                            </p>

                            {duLieu.phieuDatCoc ? (
                                <div className="text-3xl font-bold leading-tight">
                                    {duLieu.phieuDatCoc.TrangThai}
                                </div>
                            ) : (
                                <div className="text-3xl font-bold leading-tight">
                                    {duLieu.trangThaiPYC}
                                </div>
                            )}
                        </div>

                        {/* TIME */}
                        <div>
                            <p className="text-xl font-bold mb-2">
                                Thời gian còn lại:
                            </p>

                            <p className="text-[#2A754B] text-3xl font-bold">
                                {thoiGianConLai}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>

                        <h3 className="text-xl font-bold mb-4">
                            Chọn hình thức thanh toán
                        </h3>

                        <div className="border border-gray-400 overflow-hidden mb-8 rounded">

                            <label className="flex items-center gap-4 border-b border-gray-300 px-4 h-[65px] cursor-pointer">
                                <input
                                    type="radio"
                                    checked={
                                        hinhThucThanhToan === 'Tiền mặt'
                                    }
                                    onChange={() =>
                                        setHinhThucThanhToan('Tiền mặt')
                                    }
                                    disabled={
                                        daThanhToan ||
                                        !duLieu.phieuDatCoc ||
                                        duLieu.phong.TrangThai !== 'Trống'
                                    }
                                    className="w-5 h-5"
                                />

                                <span className="text-lg">
                                    Tiền mặt
                                </span>
                            </label>

                            <label className="flex items-center gap-4 px-4 h-[65px] cursor-pointer">
                                <input
                                    type="radio"
                                    checked={
                                        hinhThucThanhToan === 'Chuyển khoản'
                                    }
                                    onChange={() =>
                                        setHinhThucThanhToan('Chuyển khoản')
                                    }
                                    disabled={
                                        daThanhToan ||
                                        !duLieu.phieuDatCoc
                                    }
                                    className="w-5 h-5"
                                />

                                <span className="text-lg">
                                    Chuyển khoản
                                </span>
                            </label>
                        </div>

                        {/* BUTTON */}
                        {!daThanhToan &&
                        duLieu.phieuDatCoc &&
                        duLieu.phong.TrangThai === 'Trống' ? (
                            <button
                                onClick={GhiNhanThanhToan}
                                className="w-full h-[65px] bg-[#2A754B] hover:bg-green-800 text-white text-xl font-bold rounded"
                            >
                                Ghi nhận thanh toán
                            </button>

                        ) : daThanhToan ? (
                            <button
                                onClick={InHoaDon}
                                className="w-full h-[65px] bg-[#2A754B] hover:bg-green-800 text-white text-xl font-bold rounded"
                            >
                                In hoá đơn
                            </button>

                        ) : (
                            <button
                                disabled
                                className="w-full h-[65px] bg-gray-300 cursor-not-allowed text-white text-xl font-bold rounded"
                            >
                                Ghi nhận thanh toán
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

// ==========================
// COMPONENT ROW
// ==========================
const DongThongTin = ({ label, value }) => {
    return (
        <tr className="border border-gray-300">
            <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50 w-[220px]">
                {label}
            </td>

            <td className="border border-gray-300 px-3 py-2 text-sm">
                {value || '...'}
            </td>
        </tr>
    );
};
export default ThanhToanCoc;