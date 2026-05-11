// src/pages/Sales/XacNhanThue.jsx

import React, { useState } from 'react';
import axios from 'axios';
import SaleNavbar from '../../components/SaleNavbar';

const XacNhanThue = () => {
    const [cccd, setCccd] = useState('');
    const [duLieu, setDuLieu] = useState(null);
    const [dangTai, setDangTai] = useState(false);

    // --- NEW STATES FOR UPDATE MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formSua, setFormSua] = useState({
        HoTen: '',
        SDT: '',
        Email: '',
        GioiTinh: '',
        CCCD: ''
    });
    const [updateSuccess, setUpdateSuccess] = useState(false);

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
            const response = await axios.get(`http://localhost:5000/api/xacnhanthue/${cccd}`);
            setDuLieu(response.data);

            // Pre-fill the update form when customer is found
            setFormSua({
                HoTen: response.data.khachHang.HoTen,
                SDT: response.data.khachHang.SDT,
                Email: response.data.khachHang.Email,
                GioiTinh: response.data.khachHang.GioiTinh,
                CCCD: response.data.khachHang.CCCD
            });

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Đã xảy ra lỗi');
            setDuLieu(null);
        } finally {
            setDangTai(false);
        }
    };

    // --- LOGIC TO SUBMIT UPDATE ---
    const HandleUpdateKH = async () => {
        try {
            // Replace with your actual update API endpoint
            await axios.post(`http://localhost:5000/api/deposits/update-customer`, {
                MaKH: duLieu.khachHang.MaKH,
                ...formSua
            });

            setUpdateSuccess(true);

            // Refresh main data and close modal after 2 seconds
            setTimeout(() => {
                setUpdateSuccess(false);
                setIsModalOpen(false);
                TimKhachHang();
            }, 2000);

        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    const XacNhanThuePhong = async () => {
        try {
            await axios.post(
                `http://localhost:5000/api/xacnhanthue/confirm`,
                {
                    TienCoc: duLieu.phong.GiaThuePhong * 2,
                    MaKH: duLieu.khachHang.MaKH,
                    MaNV: null,
                    MaPhong: duLieu.phong.MaPhong,
                    MaPhieuYC: duLieu.phieuYeuCau.MaPhieuYC,
                }
            );

            setThongBao({
                hienThi: true,
                noiDung: 'Xác nhận thành công!\nThanh toán cọc mở trong 24 giờ.',
            });

            setTimeout(() => { TimKhachHang(); }, 1000);
            setTimeout(() => { setThongBao({ hienThi: false, noiDung: '' }); }, 3000);
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

                {/* --- UPDATE MODAL UI (Matches Image) --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden relative">
                            <div className="bg-[#333] text-white py-3 px-6 text-center font-bold text-lg">
                                Điền thông tin người đăng ký
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-6 relative">
                                {/* Success Message Overlay */}
                                {updateSuccess && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-10">
                                        <div className="bg-[#2A754B] text-white p-6 rounded-lg shadow-xl text-center font-bold">
                                            Cập nhật thông tin<br />khách hàng thành công!
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block font-bold mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-400 p-2 rounded"
                                        value={formSua.HoTen}
                                        onChange={(e) => setFormSua({ ...formSua, HoTen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">CCCD</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-400 p-2 rounded bg-gray-100"
                                        value={formSua.CCCD}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-bold mb-1">Giới tính</label>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="gioitinh" checked={formSua.GioiTinh === 'Nam'} onChange={() => setFormSua({ ...formSua, GioiTinh: 'Nam' })} /> Nam
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="gioitinh" checked={formSua.GioiTinh === 'Nữ'} onChange={() => setFormSua({ ...formSua, GioiTinh: 'Nữ' })} /> Nữ
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="gioitinh" checked={formSua.GioiTinh === 'Khác'} onChange={() => setFormSua({ ...formSua, GioiTinh: 'Khác' })} /> Khác:
                                            <input type="text" className="border-b border-gray-400 outline-none w-24" />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-400 p-2 rounded"
                                        value={formSua.SDT}
                                        onChange={(e) => setFormSua({ ...formSua, SDT: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Email</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-400 p-2 rounded"
                                        value={formSua.Email}
                                        onChange={(e) => setFormSua({ ...formSua, Email: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2 flex justify-end gap-4 mt-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-[#C4C4C4] hover:bg-gray-400 text-black font-bold py-2 px-10 rounded"
                                    >
                                        Huỷ
                                    </button>
                                    <button
                                        onClick={HandleUpdateKH}
                                        className="bg-[#2A754B] hover:bg-green-800 text-white font-bold py-2 px-10 rounded"
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {thongBao.hienThi && (
                    <div className="fixed top-1/2 left-1/2 z-[9999] transform -translate-x-1/2 -translate-y-1/2 bg-[#2A754B] text-white px-8 py-4 text-center text-xl font-bold shadow-2xl rounded-lg">
                        {thongBao.noiDung.split('\n').map((dong, index) => <div key={index}>{dong}</div>)}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <h2 className="text-xl font-bold leading-tight">Vui lòng chọn một khách hàng để xác nhận</h2>
                        <p className="font-semibold text-sm text-gray-600 mb-4">(nhập số CCCD)</p>

                        <div className="flex items-center gap-3 mb-6">
                            <input
                                type="text"
                                value={cccd}
                                onChange={(e) => setCccd(e.target.value)}
                                placeholder="08388388381111111"
                                className="border border-gray-400 w-[300px] h-[45px] px-4 text-base outline-none rounded"
                            />

                            <button
                                onClick={TimKhachHang}
                                disabled={dangTai}
                                className="bg-[#333333] hover:bg-black text-white px-6 h-[45px] text-base font-bold rounded shadow-sm"
                            >
                                Tìm
                            </button>

                            {/* --- THE BUTTON THAT ONLY APPEARS WHEN CUSTOMER IS FOUND --- */}
                            {duLieu && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-[#2A754B] hover:bg-green-800 text-white px-6 h-[45px] text-base font-bold rounded shadow-sm"
                                >
                                    Cập nhật
                                </button>
                            )}
                        </div>

                        {duLieu && (
                            <div className="space-y-6">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <DongThongTin label="Khách hàng" value={`${duLieu.khachHang.MaKH} - ${duLieu.khachHang.HoTen}`} />
                                        <DongThongTin label="CCCD" value={duLieu.khachHang.CCCD} />
                                        <DongThongTin label="Giới tính" value={duLieu.khachHang.GioiTinh} />
                                        <DongThongTin label="Số điện thoại" value={duLieu.khachHang.SDT} />
                                        <DongThongTin label="Email" value={duLieu.khachHang.Email} />
                                        <DongThongTin label="Ngày ở dự kiến" value={duLieu.phieuYeuCau.ThoiGianDuKien} />
                                    </tbody>
                                </table>
                                {/* ... Rest of your room info table ... */}
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
                                            <td className={`border border-gray-300 px-3 py-2 text-sm ${duLieu.phong.TrangThai === 'Trống' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}`}>
                                                {duLieu.phong.TrangThai}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Deposit Info) */}
                    <div>
                        {duLieu && (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-lg font-bold mb-1">Mức tiền cọc:</p>
                                        <p className="text-[#2A754B] text-3xl font-bold">{FormatTien(duLieu.phong.GiaThuePhong * 2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold mb-1">Trạng thái:</p>
                                        <div className="text-xl font-bold whitespace-pre-line">{duLieu.trangThaiPYC}</div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold mb-2">Nội quy chỗ ở:</h3>
                                    <div className="border border-gray-300 bg-gray-50 h-[300px] overflow-y-auto p-4 text-sm text-gray-700 whitespace-pre-line rounded">
                                        {duLieu.phong.DieuKienChoThue}
                                    </div>
                                </div>
                                <button
                                    onClick={XacNhanThuePhong}
                                    disabled={duLieu.trangThaiPYC.includes('Đã xác nhận') || duLieu.phong.TrangThai !== 'Trống'}
                                    className={`w-full py-4 text-lg font-bold text-white transition-all shadow-sm rounded-md ${duLieu.trangThaiPYC.includes('Đã xác nhận') || duLieu.phong.TrangThai !== 'Trống' ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#2A754B] hover:bg-green-800'}`}
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

const DongThongTin = ({ label, value }) => {
    return (
        <tr className="border border-gray-300">
            <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50 w-[160px]">{label}</td>
            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{value || '...'}</td>
        </tr>
    );
};

export default XacNhanThue;