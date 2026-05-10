import React, { useState } from 'react';
import SaleNavbar from '../../components/SaleNavbar';
import depositService from '../../services/depositService';
import { useAuth } from '../../context/AuthContext';

const XacNhanThue = () => {
    const { user } = useAuth();
    const [cccd, setCccd] = useState('');
    const [data, setData] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSearch = async () => {
        try {
            const result = await depositService.getPending(cccd);
            setData(result);
        } catch (err) { alert("Không tìm thấy!"); setData(null); }
    };

    const handleConfirm = async () => {
        try {
            const res = await depositService.confirm({
                maKH: data.MaKH, maPhong: data.MaPhong, maPhieuYC: data.MaPhieuYC,
                tienCoc: 6000000, maNV: user?.maNV || 'NV001'
            });
            if (res.success) setShowSuccess(true);
        } catch (err) { alert("Lỗi!"); }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <SaleNavbar />
            <div className="p-8">
                <div className="flex gap-2 mb-6">
                    <input className="border p-2 w-80" placeholder="Nhập CCCD..." onChange={e => setCccd(e.target.value)} />
                    <button onClick={handleSearch} className="bg-gray-800 text-white px-6 py-2">Tìm</button>
                </div>
                {data && (
                    <div className="flex gap-6 animate-fadeIn">
                        <div className="w-1/2 bg-white shadow-md p-4">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b"><td className="p-2 font-bold w-40">Khách hàng</td><td>{data.HoTen}</td></tr>
                                    <tr className="border-b"><td className="p-2 font-bold">Phòng</td><td>{data.MaPhong}</td></tr>
                                    <tr className="border-b"><td className="p-2 font-bold">Ngày ở dự kiến</td><td>{data.ThoiGianDuKien}</td></tr>
                                    <tr><td className="p-2 font-bold">Tình trạng</td><td className="text-green-600 font-bold">{data.TinhTrangPhong}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="w-1/2 bg-white shadow-md p-6">
                            <h3 className="text-2xl font-bold text-green-700 mb-4">6.000.000đ</h3>
                            <div className="border p-4 h-48 overflow-y-auto text-xs bg-gray-50 mb-4">Nội quy: 1. An ninh... 2. Vệ sinh...</div>
                            <button onClick={handleConfirm} className="w-full bg-[#2A754B] text-white py-3 font-bold">Xác nhận thuê</button>
                        </div>
                    </div>
                )}
            </div>
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded shadow-lg text-center">
                        <h2 className="text-[#2A754B] font-bold text-xl mb-4">Xác nhận thành công!</h2>
                        <p className="mb-4">Vui lòng thanh toán cọc trong 24 giờ.</p>
                        <button onClick={() => setShowSuccess(false)} className="bg-gray-800 text-white px-8 py-2">Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default XacNhanThue;