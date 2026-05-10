import React, { useState } from 'react';
import SaleNavbar from '../../components/SaleNavbar';
import depositService from '../../services/depositService';

const ThanhToanCoc = () => {
    const [cccd, setCccd] = useState('');
    const [data, setData] = useState(null);
    const [hinhThuc, setHinhThuc] = useState('Tiền mặt');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSearch = async () => {
        try {
            const result = await depositService.getInfo(cccd);
            setData(result);
        } catch (err) { alert("Không thấy!"); setData(null); }
    };

    const handlePay = async () => {
        try {
            const res = await depositService.pay(data.MaPhieuDatCoc, hinhThuc);
            if (res.success) setShowSuccess(true);
        } catch (err) { alert("Lỗi!"); }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <SaleNavbar />
            <div className="p-8">
                <div className="flex gap-2 mb-6">
                    <input className="border p-2 w-80" placeholder="CCCD khách..." onChange={e => setCccd(e.target.value)} />
                    <button onClick={handleSearch} className="bg-gray-800 text-white px-6 py-2">Tìm</button>
                </div>
                {data && (
                    <div className="bg-white shadow-md p-6 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-3xl font-bold text-[#2A754B]">6.000.000đ</h3>
                                <p className="mt-4">Trạng thái: <span className="text-red-600 font-bold">Chưa thanh toán</span></p>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Hình thức thanh toán</p>
                                <label className="block border p-2 mb-2">
                                    <input type="radio" checked={hinhThuc === 'Tiền mặt'} onChange={() => setHinhThuc('Tiền mặt')} /> Tiền mặt
                                </label>
                                <label className="block border p-2">
                                    <input type="radio" checked={hinhThuc === 'Chuyển khoản'} onChange={() => setHinhThuc('Chuyển khoản')} /> Chuyển khoản
                                </label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={handlePay} className="bg-[#2A754B] text-white px-8 py-2 font-bold">Ghi nhận thanh toán</button>
                        </div>
                    </div>
                )}
            </div>
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded shadow-lg text-center">
                        <div className="bg-[#2A754B] text-white p-2 mb-4 font-bold">Thành công!</div>
                        <p className="mb-4 text-sm font-bold">Hẹn nhận phòng: 15/12/2026 - 14:00</p>
                        <button onClick={() => setShowSuccess(false)} className="bg-gray-800 text-white px-8 py-2">Xác nhận</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThanhToanCoc;