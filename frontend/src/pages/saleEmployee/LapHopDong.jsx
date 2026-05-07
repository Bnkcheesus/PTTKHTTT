import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SaleNavbar from '../../components/SaleNavbar';
import hopDongService from '../../services/hopDongService';
import { useAuth } from '../../context/AuthContext';

const LapHopDong = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deposits, setDeposits] = useState([]);
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [ngayBatDau, setNgayBatDau] = useState('');
    const [ngayKetThuc, setNgayKetThuc] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [newContractId, setNewContractId] = useState('');
    const [thongBao, setThongBao] = useState({ hienThi: false, noiDung: '', loai: '' });
    const [showToast, setShowToast] = useState(false);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        loadDeposits();
    }, []);

    const loadDeposits = async () => {
        try {
            const data = await hopDongService.getApprovedDepositsNoContract();
            setDeposits(data);
        } catch (err) {
            setThongBao({ hienThi: true, noiDung: 'Lỗi tải danh sách phiếu đặt cọc', loai: 'error' });
        }
    };

    const handleCreateContract = async () => {
        if (!selectedDeposit) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng chọn phiếu đặt cọc', loai: 'error' });
            return;
        }
        if (!ngayBatDau || !ngayKetThuc) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng chọn ngày bắt đầu và ngày kết thúc', loai: 'error' });
            return;
        }
        if (!noiDung.trim()) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng nhập nội dung hợp đồng', loai: 'error' });
            return;
        }

        // Validate date logic (date picker returns YYYY-MM-DD format)
        if (ngayBatDau >= ngayKetThuc) {
            setThongBao({ hienThi: true, noiDung: 'Ngày kết thúc phải sau ngày bắt đầu', loai: 'error' });
            return;
        }

        setLoading(true);
        try {
            const result = await hopDongService.createContract(
                selectedDeposit.MaPhieuDatCoc,
                ngayBatDau,
                ngayKetThuc,
                noiDung,
                user?.MaNV
            );

            if (result.success || result.MaHD) {
                setNewContractId(result.MaHD || 'HD001');
                setIsSuccess(true);
            }
        } catch (err) {
            setThongBao({ hienThi: true, noiDung: err.response?.data?.error || 'Lỗi tạo hợp đồng', loai: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        // Handle YYYY-MM-DD format from date picker or database
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        // Handle ISO format with time
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleReset = () => {
        setIsSuccess(false);
        setSelectedDeposit(null);
        setNgayBatDau('');
        setNgayKetThuc('');
        setNoiDung('');
        setThongBao({ hienThi: false, noiDung: '', loai: '' });
    };

    const handleCancel = () => {
        navigate('/dang-ky-phong');
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white">
                <SaleNavbar />
                <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-gradient-to-b from-green-50 to-white">
                    <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-6">
                                <svg className="w-24 h-24 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-green-600 mb-4">Thành công!</h1>
                            <p className="text-gray-700 text-lg mb-2">Hợp đồng đã được tạo thành công</p>
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-gray-700 font-semibold">Mã hợp đồng: <span className="text-green-600">{newContractId}</span></p>
                                <p className="text-gray-600 mt-2">Khách hàng: <span className="font-semibold">{selectedDeposit?.HoTen}</span></p>
                                <p className="text-gray-600 mt-1">Từ ngày: <span className="font-semibold">{formatDateForDisplay(ngayBatDau)}</span></p>
                                <p className="text-gray-600 mt-1">Đến ngày: <span className="font-semibold">{formatDateForDisplay(ngayKetThuc)}</span></p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                                >
                                    Tạo hợp đồng mới
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <SaleNavbar />
            <div className="p-8 max-w-[1200px] mx-auto">
                {/* Thông báo */}
                {thongBao.hienThi && (
                    <div className={`mb-6 p-4 rounded-lg ${thongBao.loai === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {thongBao.noiDung}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-8">
                    {/* LEFT: Thông tin đặt cọc và Nội dung hợp đồng */}
                    <div className="col-span-2">
                        {/* TOP: Thông tin đặt cọc */}
                        <div>
                            <h2 className="font-bold mb-4">Thông tin đặt cọc của khách đã duyệt</h2>
                            <div className="p-4 rounded shadow-sm mb-8" style={{ backgroundColor: '#d9ead3' }}>
                                <div className="flex border border-gray-400 bg-white mb-2">
                                    <input placeholder="Mã phiếu đặt cọc" className="p-2 border-r border-gray-400 w-1/4 outline-none text-xs" />
                                    <input placeholder="Tên khách" className="p-2 border-r border-gray-400 w-1/4 outline-none text-xs" />
                                    <input placeholder="Ngày lập phiếu" className="p-2 border-r border-gray-400 w-1/4 outline-none text-xs" />
                                    <input placeholder="Mã nhóm" className="p-2 w-1/4 outline-none text-xs" />
                                    <button className="bg-[#3c3836] text-white px-4 text-xs font-bold">Tìm</button>
                                </div>
                                <div className="bg-white border border-gray-400 max-h-[200px] overflow-y-auto">
                                    <table className="w-full text-xs border-collapse">
                                        <tbody>
                                            {deposits.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="p-2 text-center text-gray-500">
                                                        Không có phiếu đặt cọc được duyệt
                                                    </td>
                                                </tr>
                                            ) : (
                                                deposits.map((deposit, idx) => (
                                                    <tr key={idx} className="border-b border-gray-300">
                                                        <td className="p-2 border-r border-gray-300">{deposit.MaPhieuDatCoc}</td>
                                                        <td className="p-2 border-r border-gray-300">{deposit.HoTen}</td>
                                                        <td className="p-2 border-r border-gray-300">{formatDateForDisplay(deposit.NgayLap)}</td>
                                                        <td className="p-2 border-r border-gray-300">{deposit.MaNhom || 'Không có'}</td>
                                                        <td className="p-2 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedDeposit?.MaPhieuDatCoc === deposit.MaPhieuDatCoc}
                                                                onChange={() => setSelectedDeposit(selectedDeposit?.MaPhieuDatCoc === deposit.MaPhieuDatCoc ? null : deposit)}
                                                                className="cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM: Nội dung hợp đồng */}
                        <div>
                            <h2 className="font-bold mb-4">Nội dung hợp đồng (Giới hạn 500 kí tự)</h2>
                            <div className="p-4 rounded shadow-sm" style={{ backgroundColor: '#f5f5f5' }}>
                                <textarea
                                    value={noiDung}
                                    onChange={(e) => setNoiDung(e.target.value.slice(0, 500))}
                                    placeholder="Nội dung"
                                    maxLength="500"
                                    rows="8"
                                    className="w-full p-2 border border-gray-400 bg-white outline-none text-xs resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {noiDung.length}/500
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Date inputs */}
                    <div className="col-span-1">
                        {/* Thời gian bắt đầu thuê */}
                        <div className="mb-12">
                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                Thời gian bắt đầu thuê
                            </label>
                            <input
                                type="date"
                                value={ngayBatDau}
                                onChange={(e) => setNgayBatDau(e.target.value)}
                                className="w-full border-b-2 border-gray-800 bg-transparent outline-none text-xs p-1"
                            />
                        </div>

                        {/* Thời gian kết thúc thuê */}
                        <div className="mb-12">
                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                Thời gian kết thúc thuê
                            </label>
                            <input
                                type="date"
                                value={ngayKetThuc}
                                onChange={(e) => setNgayKetThuc(e.target.value)}
                                className="w-full border-b-2 border-gray-800 bg-transparent outline-none text-xs p-1"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 justify-end pt-8">
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="bg-[#3c3836] hover:bg-[#2a2622] disabled:bg-gray-400 text-white px-6 py-2 text-xs font-bold rounded shadow"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateContract}
                                disabled={loading}
                                className="bg-[#237850] hover:bg-[#1d5f3f] disabled:bg-gray-400 text-white px-6 py-2 text-xs font-bold rounded shadow"
                            >
                                {loading ? 'Xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LapHopDong;
