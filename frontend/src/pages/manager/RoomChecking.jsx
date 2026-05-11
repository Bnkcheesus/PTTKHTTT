import React, { useEffect, useState } from 'react';
import ManagerNavbar from '../../components/ManagerNavbar';
import { useAuth } from '../../context/AuthContext';
import roomCheckingService from '../../services/roomCheckingService';
import hopDongService from '../../services/hopDongService';

export default function RoomChecking() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState(null);
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [damageItems, setDamageItems] = useState([]);
    const [formData, setFormData] = useState({
        SoDienDung: '',
        SoNuocDung: '',
        TienThueNo: '',
        TienPhat: '',
        MaThietBi: '',
        SoLuongHuHong: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadCandidates();
        loadEquipmentOptions();
    }, []);

    useEffect(() => {
        const normalized = searchTerm.trim().toLowerCase();
        setFilteredCandidates(
            candidates.filter((item) =>
                item.MaPhieuTra.toLowerCase().includes(normalized) ||
                item.MaHopDong.toLowerCase().includes(normalized) ||
                item.MaPhieuDatCoc.toLowerCase().includes(normalized) ||
                item.HoTen.toLowerCase().includes(normalized) ||
                item.MaPhong?.toLowerCase().includes(normalized)
            )
        );
    }, [searchTerm, candidates]);

    const loadCandidates = async () => {
        try {
            const data = await roomCheckingService.getInspectionCandidates();
            setCandidates(data || []);
            setFilteredCandidates(data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể lấy danh sách phiếu trả phòng chờ kiểm tra.');
        }
    };

    const loadEquipmentOptions = async () => {
        try {
            const data = await hopDongService.getEquipmentList();
            setEquipmentOptions(data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách thiết bị.');
        }
    };

    const handleSelectCandidate = async (MaPhieuTra) => {
        try {
            setIsLoading(true);
            setError('');
            setMessage('');
            const data = await roomCheckingService.getHandoverInfo(MaPhieuTra);
            setSelectedContract(data);
            setSearchTerm(MaPhieuTra);
        } catch (err) {
            setError(err.response?.data?.error || 'Không tìm thấy thông tin bàn giao.');
            setSelectedContract(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddDamageItem = () => {
        if (!formData.MaThietBi) {
            setError('Vui lòng chọn thiết bị hư hỏng.');
            return;
        }
        const quantity = parseInt(formData.SoLuongHuHong, 10);
        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError('Số lượng hư hỏng phải là số nguyên lớn hơn 0.');
            return;
        }

        setError('');
        setDamageItems((prev) => {
            const existing = prev.find((item) => item.MaThietBi === formData.MaThietBi);
            if (existing) {
                return prev.map((item) =>
                    item.MaThietBi === formData.MaThietBi
                        ? { ...item, SoLuongHuHong: item.SoLuongHuHong + quantity }
                        : item
                );
            }
            return [...prev, { MaThietBi: formData.MaThietBi, SoLuongHuHong: quantity }];
        });
        setFormData((prev) => ({ ...prev, MaThietBi: '', SoLuongHuHong: '' }));
    };

    const handleRemoveDamageItem = (MaThietBi) => {
        setDamageItems((prev) => prev.filter((item) => item.MaThietBi !== MaThietBi));
    };

    const resetForm = () => {
        setSelectedContract(null);
        setDamageItems([]);
        setFormData({
            SoDienDung: '',
            SoNuocDung: '',
            TienThueNo: '',
            TienPhat: '',
            MaThietBi: '',
            SoLuongHuHong: '',
        });
        setSearchTerm('');
        setError('');
        setMessage('');
    };

    const handleCreateInspection = async () => {
        if (!selectedContract) {
            setError('Vui lòng chọn một phiếu trả phòng để kiểm tra.');
            return;
        }

        const tienThueNo = parseFloat(formData.TienThueNo);
        const tienPhat = parseFloat(formData.TienPhat);
        const soDienDung = parseFloat(formData.SoDienDung) || 0;
        const soNuocDung = parseFloat(formData.SoNuocDung) || 0;

        if (isNaN(tienThueNo) || tienThueNo < 0) {
            setError('Tiền thuê nợ phải là số lớn hơn hoặc bằng 0.');
            return;
        }
        if (isNaN(tienPhat) || tienPhat < 0) {
            setError('Tiền phạt phải là số lớn hơn hoặc bằng 0.');
            return;
        }
        if (!selectedContract.MaPhieuTra) {
            setError('Hợp đồng này chưa có phiếu trả phòng hợp lệ.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const result = await roomCheckingService.createInspectionVoucher({
                MaPhieuTra: selectedContract.MaPhieuTra,
                SoDienDung: soDienDung,
                SoNuocDung: soNuocDung,
                TienThueNo: tienThueNo,
                TienPhat: tienPhat,
                MaNV: user?.MaNV,
            });

            const MaPhieuKiemTra = result?.MaPhieuKiemTra;
            if (!MaPhieuKiemTra) {
                throw new Error('Không tạo được phiếu kiểm tra.');
            }

            for (const item of damageItems) {
                await roomCheckingService.addInspectionDetail(MaPhieuKiemTra, item.MaThietBi, item.SoLuongHuHong);
            }

            setMessage(`Tạo phiếu kiểm tra thành công: ${MaPhieuKiemTra}`);
            resetForm();
            await loadCandidates();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Tạo phiếu kiểm tra thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const totalCharge = (() => {
        const tienThueNo = parseFloat(formData.TienThueNo) || 0;
        const tienPhat = parseFloat(formData.TienPhat) || 0;
        return tienThueNo + tienPhat;
    })();

    return (
        <div className="min-h-screen bg-gray-100">
            <ManagerNavbar />
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800">Kiểm Tra Hiện Trạng Phòng</h2>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 rounded p-4">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 border border-green-300 text-green-700 rounded p-4">
                        {message}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Phiếu trả phòng chờ kiểm tra</h3>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                    placeholder="Tìm MaPTP, MaHD, MaPDC, Khách hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-3 py-2">Mã PTP</th>
                                        <th className="px-3 py-2">Mã HĐ</th>
                                        <th className="px-3 py-2">Mã PĐC</th>
                                        <th className="px-3 py-2">Tên khách</th>
                                        <th className="px-3 py-2">Phòng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.length > 0 ? (
                                        filteredCandidates.map((item) => (
                                            <tr
                                                key={item.MaPhieuTra}
                                                className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                                                onClick={() => handleSelectCandidate(item.MaPhieuTra)}
                                            >
                                                <td className="px-3 py-3 font-medium text-gray-800">{item.MaPhieuTra}</td>
                                                <td className="px-3 py-3">{item.MaHopDong}</td>
                                                <td className="px-3 py-3">{item.MaPhieuDatCoc}</td>
                                                <td className="px-3 py-3">{item.HoTen}</td>
                                                <td className="px-3 py-3">{item.MaPhong || 'N/A'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-3 py-4 text-sm text-gray-500">
                                                Không có phiếu trả phòng chờ kiểm tra.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800">Thông tin bàn giao</h3>
                        {!selectedContract ? (
                            <p className="mt-3 text-gray-500">Vui lòng chọn một phiếu trả phòng.</p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã hợp đồng</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.MaHopDong}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã phiếu đặt cọc</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.MaPhieuDatCoc}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã phiếu trả phòng</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.MaPhieuTra || 'Chưa có'}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Phòng</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.MaPhong || 'N/A'}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Khách hàng</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.HoTen}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Liên hệ</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.SDT || selectedContract.Email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.NgayBatDau || 'N/A'}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Ngày kết thúc</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.NgayKetThuc || 'N/A'}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Giá thuê phòng</p>
                                        <p className="font-semibold text-gray-900">{selectedContract.GiaThuePhong ? selectedContract.GiaThuePhong.toLocaleString('vi-VN') + ' đ' : 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">Chi phí kiểm tra</h4>
                                        <div className="grid gap-4 sm:grid-cols-2 mt-3">
                                            <label className="space-y-1 text-sm text-gray-700">
                                                Số điện dùng
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.SoDienDung}
                                                    onChange={(e) => handleChange('SoDienDung', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập số điện dùng"
                                                />
                                            </label>
                                            <label className="space-y-1 text-sm text-gray-700">
                                                Số nước dùng
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.SoNuocDung}
                                                    onChange={(e) => handleChange('SoNuocDung', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập số nước dùng"
                                                />
                                            </label>
                                            <label className="space-y-1 text-sm text-gray-700">
                                                Tiền thuê nợ
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.TienThueNo}
                                                    onChange={(e) => handleChange('TienThueNo', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập tiền thuê nợ"
                                                />
                                            </label>
                                            <label className="space-y-1 text-sm text-gray-700">
                                                Tiền phạt
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.TienPhat}
                                                    onChange={(e) => handleChange('TienPhat', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập tiền phạt"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">Thiết bị hư hỏng</h4>
                                        <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_0.7fr] mt-3">
                                            <select
                                                value={formData.MaThietBi}
                                                onChange={(e) => handleChange('MaThietBi', e.target.value)}
                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                            >
                                                <option value="">Chọn thiết bị</option>
                                                {equipmentOptions.map((item) => (
                                                    <option key={item.MaThietBi} value={item.MaThietBi}>
                                                        {item.TenThietBi}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.SoLuongHuHong}
                                                onChange={(e) => handleChange('SoLuongHuHong', e.target.value)}
                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                placeholder="Số lượng"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddDamageItem}
                                                className="rounded bg-[#2A754B] px-4 py-2 text-white transition hover:bg-[#235d3e]"
                                            >
                                                Thêm
                                            </button>
                                        </div>

                                        {damageItems.length > 0 && (
                                            <div className="mt-4 overflow-x-auto">
                                                <table className="w-full text-left text-sm text-gray-700">
                                                    <thead>
                                                        <tr className="border-b border-gray-200">
                                                            <th className="px-3 py-2">Thiết bị</th>
                                                            <th className="px-3 py-2">Số lượng hư</th>
                                                            <th className="px-3 py-2">Hành động</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {damageItems.map((item) => {
                                                            const equipment = equipmentOptions.find((eq) => eq.MaThietBi === item.MaThietBi);
                                                            return (
                                                                <tr key={item.MaThietBi} className="border-b border-gray-100">
                                                                    <td className="px-3 py-3">{equipment?.TenThietBi || item.MaThietBi}</td>
                                                                    <td className="px-3 py-3">{item.SoLuongHuHong}</td>
                                                                    <td className="px-3 py-3">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveDamageItem(item.MaThietBi)}
                                                                            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm text-gray-600">Tổng phí</p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900">{totalCharge.toLocaleString('vi-VN')} đ</p>
                                        <p className="mt-2 text-sm text-gray-500">Bao gồm tiền thuê nợ và tiền phạt.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Đặt lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateInspection}
                                        disabled={isLoading}
                                        className="rounded bg-[#2A754B] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#235d3e] disabled:opacity-60"
                                    >
                                        {isLoading ? 'Đang lưu...' : 'Lưu phiếu kiểm tra'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
