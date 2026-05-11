import React, { useEffect, useState } from 'react';
import SaleNavbar from '../../components/SaleNavbar';
import appointmentService from '../../services/appointmentService';
import depositService from '../../services/depositService';
import { useAuth } from '../../context/AuthContext';

const XacNhanThue = () => {
    const { user } = useAuth();
    const [pendingSchedules, setPendingSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [message, setMessage] = useState('');

    const loadPending = async () => {
        try {
            const data = await appointmentService.getPendingConfirmations();
            setPendingSchedules(data);
        } catch (err) {
            setPendingSchedules([]);
            setMessage('Không thể tải danh sách xác nhận thuê.');
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    const handleConfirm = async () => {
        if (!selectedSchedule) return;
        setLoading(true);
        setMessage('');

        try {
            const res = await depositService.confirm({
                maKH: selectedSchedule.MaKH,
                maPhong: selectedSchedule.MaPhong,
                maPhieuYC: selectedSchedule.MaPhieuYC,
                tienCoc: 6000000,
                maNV: user?.MaNV || 'NV001'
            });
            if (res.success) {
                setShowSuccess(true);
                setSelectedSchedule(null);
                await loadPending();
            }
        } catch (err) {
            setMessage(err.response?.data?.error || 'Xác nhận thuê thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <SaleNavbar />
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Xác nhận thuê</h1>
                    <p className="text-gray-600">Danh sách khách hàng đã hẹn lịch. Chọn một dòng để xác nhận thuê và tạo phiếu đặt cọc.</p>
                </div>

                {message && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
                )}

                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-semibold mb-4">Chờ xác nhận</h2>
                        <div className="space-y-2 max-h-[560px] overflow-y-auto">
                            {pendingSchedules.length === 0 ? (
                                <div className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                                    Hiện không có khách hàng chờ xác nhận thuê.
                                </div>
                            ) : (
                                pendingSchedules.map((item) => (
                                    <button
                                        key={item.MaPhieuYC}
                                        onClick={() => setSelectedSchedule(item)}
                                        className={`w-full text-left rounded-lg border px-4 py-3 transition ${selectedSchedule?.MaPhieuYC === item.MaPhieuYC ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.HoTen}</p>
                                                <p className="text-xs text-gray-500">CCCD: {item.CCCD}</p>
                                            </div>
                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{item.MaPhong || 'Chưa rõ'}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">Ngày ở dự kiến: {item.ThoiGianDuKien || 'Chưa có'}</p>
                                        <p className="text-sm text-gray-600">Lịch hẹn: {item.ThoiGianHen || 'Chưa có'}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            {selectedSchedule ? (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Khách hàng</p>
                                            <p className="text-lg font-semibold text-gray-900">{selectedSchedule.HoTen}</p>
                                            <p className="mt-1 text-sm text-gray-600">CCCD: {selectedSchedule.CCCD}</p>
                                            <p className="text-sm text-gray-600">SĐT: {selectedSchedule.SDT || 'Chưa có'}</p>
                                            <p className="text-sm text-gray-600">Email: {selectedSchedule.Email || 'Chưa có'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phòng</p>
                                            <p className="text-lg font-semibold text-gray-900">{selectedSchedule.MaPhong || 'Chưa chọn'}</p>
                                            <p className="mt-1 text-sm text-gray-600">Trạng thái phòng: {selectedSchedule.TinhTrangPhong || 'Không rõ'}</p>
                                            <p className="text-sm text-gray-600">Hình thức thuê: {selectedSchedule.HinhThucThue || 'Không rõ'}</p>
                                            <p className="text-sm text-gray-600">Số người: {selectedSchedule.SoNguoiDuKien || 'Không rõ'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5">
                                        <p className="text-sm text-gray-500">Số tiền cọc bắt buộc</p>
                                        <p className="mt-2 text-4xl font-bold text-green-700">6.000.000₫</p>
                                        <p className="mt-3 text-sm text-gray-600">Phiếu đặt cọc sẽ được tạo và chuyển khách sang trang thanh toán trong 24 giờ.</p>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            onClick={handleConfirm}
                                            disabled={loading}
                                            className="inline-flex items-center justify-center rounded bg-[#2A754B] px-6 py-3 text-white transition hover:bg-[#225d44] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loading ? 'Đang xử lý...' : 'Xác nhận thuê'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedSchedule(null)}
                                            className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
                                        >
                                            Bỏ chọn
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                                    Chọn một khách hàng bên trái để xem chi tiết và xác nhận thuê.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-xl">
                        <h2 className="text-2xl font-bold text-[#2A754B]">Xác nhận thuê thành công!</h2>
                        <p className="mt-4 text-gray-600">Phiếu đặt cọc đã được tạo. Khách hàng có 24 giờ để thanh toán cọc.</p>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="mt-8 inline-flex rounded bg-gray-800 px-6 py-3 text-white hover:bg-gray-700"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default XacNhanThue;