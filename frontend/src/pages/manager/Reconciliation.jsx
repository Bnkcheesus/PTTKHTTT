import React, { useEffect, useMemo, useState } from 'react';
import ManagerNavbar from '../../components/ManagerNavbar';
import AccountingNavbar from '../../components/AccountingNavbar';
import reconciliationService from '../../services/reconciliationService';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value || 0);
};

const calculateRefundRate = (maHopDong, ngayBatDau, ngayKetThuc) => {
    if (!maHopDong) {
        return { ratio: 0.8, reason: 'Không có hợp đồng' };
    }

    const now = new Date();
    const endedAt = ngayKetThuc ? new Date(ngayKetThuc) : null;
    const startedAt = ngayBatDau ? new Date(ngayBatDau) : null;

    if (endedAt && endedAt < now) {
        return { ratio: 1.0, reason: 'Hợp đồng đã hết hạn' };
    }

    if (startedAt && endedAt) {
        const months = (endedAt.getFullYear() - startedAt.getFullYear()) * 12 + (endedAt.getMonth() - startedAt.getMonth());
        if (months >= 6) {
            return { ratio: 0.7, reason: 'Hợp đồng từ 6 tháng trở lên' };
        }
        return { ratio: 0.5, reason: 'Hợp đồng dưới 6 tháng' };
    }

    return { ratio: 0.5, reason: 'Hợp đồng còn hiệu lực' };
};

export default function Reconciliation({ mode = 'accounting' }) {
    const isManagerMode = mode === 'manager';
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [createdReconciliations, setCreatedReconciliations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [formData, setFormData] = useState({ GiaDien: '', GiaNuoc: '', TienNoKhac: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isManagerMode) {
            loadCreatedReconciliations();
        } else {
            loadCandidates();
        }
    }, [isManagerMode]);

    useEffect(() => {
        const normalized = searchTerm.trim().toLowerCase();
        setFilteredCandidates(
            candidates.filter((item) =>
                item.MaPhieuKiemTra?.toLowerCase().includes(normalized) ||
                item.MaPhieuTra?.toLowerCase().includes(normalized) ||
                item.MaHopDong?.toLowerCase().includes(normalized) ||
                item.MaPhieuDatCoc?.toLowerCase().includes(normalized) ||
                item.HoTen?.toLowerCase().includes(normalized) ||
                item.MaPhong?.toLowerCase().includes(normalized)
            )
        );
    }, [searchTerm, candidates]);

    const loadCandidates = async () => {
        try {
            const data = await reconciliationService.getCandidates();
            setCandidates(data || []);
            setFilteredCandidates(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách đối soát.');
        }
    };

    const loadCreatedReconciliations = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await reconciliationService.getCreatedReconciliations();
            setCreatedReconciliations(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách phiếu đối soát.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveReconciliation = async (maBang) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await reconciliationService.approveReconciliation(maBang);
            setMessage(`Đã duyệt phiếu đối soát ${maBang}.`);
            await loadCreatedReconciliations();
        } catch (err) {
            setError(err.response?.data?.message || 'Duyệt phiếu đối soát thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCandidate = async (maPhieuKiemTra) => {
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const data = await reconciliationService.getCandidateDetail(maPhieuKiemTra);
            setSelectedCandidate(data);
            setSearchTerm(maPhieuKiemTra);
            setFormData({ GiaDien: '', GiaNuoc: '', TienNoKhac: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lấy chi tiết đối soát.');
            setSelectedCandidate(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setSelectedCandidate(null);
        setFormData({ GiaDien: '', GiaNuoc: '', TienNoKhac: '' });
        setSearchTerm('');
    };

    const preview = useMemo(() => {
        if (!selectedCandidate) return null;

        const giaDien = Number(formData.GiaDien) || 0;
        const giaNuoc = Number(formData.GiaNuoc) || 0;
        const tienNoKhac = Number(formData.TienNoKhac) || 0;
        const inspectionElectric = Number(selectedCandidate.SoDienDung || 0);
        const inspectionWater = Number(selectedCandidate.SoNuocDung || 0);
        const thueNo = Number(selectedCandidate.TienThueNo || 0);
        const phat = Number(selectedCandidate.TienPhat || 0);
        const deposit = Number(selectedCandidate.TienCoc || 0);

        const refundMeta = calculateRefundRate(
            selectedCandidate.MaHopDong,
            selectedCandidate.NgayBatDau,
            selectedCandidate.NgayKetThuc
        );

        const electricAmount = Number((giaDien * inspectionElectric).toFixed(2));
        const waterAmount = Number((giaNuoc * inspectionWater).toFixed(2));
        const totalDeductions = Number((electricAmount + waterAmount + thueNo + phat + tienNoKhac).toFixed(2));
        const refundAmount = Number((deposit * refundMeta.ratio).toFixed(2));
        const difference = Number((refundAmount - totalDeductions).toFixed(2));

        return {
            refundMeta,
            deposit,
            refundAmount,
            electricAmount,
            waterAmount,
            thueNo,
            phat,
            tienNoKhac,
            totalDeductions,
            difference,
            deductionRows: [
                { label: 'Tiền điện', value: electricAmount },
                { label: 'Tiền nước', value: waterAmount },
                { label: 'Tiền thuê nợ', value: thueNo },
                { label: 'Tiền phạt', value: phat },
                { label: 'Nợ khác', value: tienNoKhac },
            ].filter((row) => row.value > 0),
        };
    }, [selectedCandidate, formData]);

    const handleCreateReconciliation = async () => {
        if (!selectedCandidate) {
            setError('Vui lòng chọn một phiếu kiểm tra để đối soát.');
            return;
        }

        const giaDien = Number(formData.GiaDien);
        const giaNuoc = Number(formData.GiaNuoc);
        const tienNoKhac = Number(formData.TienNoKhac);

        if (isNaN(giaDien) || giaDien < 0) {
            setError('Giá điện phải là số không âm.');
            return;
        }
        if (isNaN(giaNuoc) || giaNuoc < 0) {
            setError('Giá nước phải là số không âm.');
            return;
        }
        if (isNaN(tienNoKhac) || tienNoKhac < 0) {
            setError('Tiền nợ khác phải là số không âm.');
            return;
        }

        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const result = await reconciliationService.createReconciliation({
                MaPhieuKiemTra: selectedCandidate.MaPhieuKiemTra,
                GiaDien: giaDien,
                GiaNuoc: giaNuoc,
                TienNoKhac: tienNoKhac,
            });

            setMessage(`Lập bảng đối soát thành công: ${result.MaBang}`);
            resetForm();
            await loadCandidates();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lập bảng đối soát thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isManagerMode) {
        return (
            <div className="min-h-screen bg-gray-100">
                <ManagerNavbar />
                <div className="p-6 space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800">Duyệt Phiếu Đối Soát</h2>
                        <p className="text-gray-600 mt-2">
                            Danh sách phiếu đối soát do nhân viên kế toán lập, chờ nhân viên quản lý kiểm tra và duyệt.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Phiếu đối soát đã lập</h3>
                                <p className="text-sm text-gray-500">Có {createdReconciliations.length} phiếu đối soát.</p>
                            </div>
                            <button
                                onClick={loadCreatedReconciliations}
                                disabled={isLoading}
                                className="rounded bg-[#2A754B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#235d3e] disabled:opacity-50"
                            >
                                Tải lại
                            </button>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-3 py-3">Mã bảng</th>
                                        <th className="px-3 py-3">Mã PTP</th>
                                        <th className="px-3 py-3">Khách</th>
                                        <th className="px-3 py-3">Phòng</th>
                                        <th className="px-3 py-3">Hoàn cọc</th>
                                        <th className="px-3 py-3">Khấu trừ</th>
                                        <th className="px-3 py-3">Trạng thái</th>
                                        <th className="px-3 py-3">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createdReconciliations.length > 0 ? (
                                        createdReconciliations.map((item) => (
                                            <tr key={item.MaBang} className="border-b border-gray-100">
                                                <td className="px-3 py-3 font-medium text-gray-900">{item.MaBang}</td>
                                                <td className="px-3 py-3">{item.MaPhieuTra}</td>
                                                <td className="px-3 py-3">{item.HoTen || 'N/A'}</td>
                                                <td className="px-3 py-3">{item.MaPhong || 'N/A'}</td>
                                                <td className="px-3 py-3">{formatCurrency(item.SoTienHoanCoc)}</td>
                                                <td className="px-3 py-3">{formatCurrency(item.TongKhauTru)}</td>
                                                <td className="px-3 py-3">
                                                    <span className={`rounded px-2 py-1 text-xs font-semibold ${item.TrangThai === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {item.TrangThai || 'Chờ duyệt'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <button
                                                        onClick={() => handleApproveReconciliation(item.MaBang)}
                                                        disabled={isLoading || item.TrangThai === 'Đã duyệt'}
                                                        className="rounded bg-[#2A754B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#235d3e] disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Duyệt
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-3 py-4 text-sm text-gray-500">
                                                Không có phiếu đối soát nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <AccountingNavbar />
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800">Lập Phiếu Đối Soát</h2>
                    <p className="text-gray-600 mt-2">
                        Chọn phiếu kiểm tra đang chờ đối soát, nhập giá điện/nước và nợ khác để xem trước chi tiết khấu trừ.
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
                        {message}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Danh sách phiếu chờ đối soát</h3>
                                <p className="text-sm text-gray-500">Có {candidates.length} phiếu đối soát khả dụng.</p>
                            </div>
                            <input
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none sm:w-72"
                                placeholder="Tìm MaPKT, MaPTP, MaHD, khách..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-3 py-3">Mã PKT</th>
                                        <th className="px-3 py-3">Mã PTP</th>
                                        <th className="px-3 py-3">Mã HĐ</th>
                                        <th className="px-3 py-3">Khách</th>
                                        <th className="px-3 py-3">Phòng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.length > 0 ? (
                                        filteredCandidates.map((item) => (
                                            <tr
                                                key={item.MaPhieuKiemTra}
                                                className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${selectedCandidate?.MaPhieuKiemTra === item.MaPhieuKiemTra ? 'bg-green-50' : ''}`}
                                                onClick={() => handleSelectCandidate(item.MaPhieuKiemTra)}
                                            >
                                                <td className="px-3 py-3 font-medium text-gray-800">{item.MaPhieuKiemTra}</td>
                                                <td className="px-3 py-3">{item.MaPhieuTra}</td>
                                                <td className="px-3 py-3">{item.MaHopDong || 'Không có'}</td>
                                                <td className="px-3 py-3">{item.HoTen}</td>
                                                <td className="px-3 py-3">{item.MaPhong || 'N/A'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-3 py-4 text-sm text-gray-500">
                                                Không có phiếu đối soát chờ xử lý.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800">Thông tin phiếu kiểm tra</h3>

                        {!selectedCandidate ? (
                            <p className="mt-4 text-gray-500">Chọn một phiếu kiểm tra để xem chi tiết và lập bảng đối soát.</p>
                        ) : (
                            <div className="space-y-5">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã phiếu kiểm tra</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.MaPhieuKiemTra}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã phiếu trả phòng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.MaPhieuTra}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã hợp đồng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.MaHopDong || 'Không có'}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Mã phiếu đặt cọc</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.MaPhieuDatCoc}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Khách hàng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.HoTen}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Phòng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.MaPhong || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Tiền cọc gốc</p>
                                        <p className="font-semibold text-gray-900">{formatCurrency(selectedCandidate.TienCoc)}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Ngày trả phòng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.NgayTraPhong || 'N/A'}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Số điện dùng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.SoDienDung ?? 0}</p>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Số nước dùng</p>
                                        <p className="font-semibold text-gray-900">{selectedCandidate.SoNuocDung ?? 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">Giá trị đối soát</h4>
                                        <div className="grid gap-3 sm:grid-cols-2 mt-3">
                                            <label className="space-y-2 text-sm text-gray-700">
                                                Giá điện (đồng/kWh)
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.GiaDien}
                                                    onChange={(e) => handleChange('GiaDien', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập giá điện"
                                                />
                                            </label>
                                            <label className="space-y-2 text-sm text-gray-700">
                                                Giá nước (đồng/m3)
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.GiaNuoc}
                                                    onChange={(e) => handleChange('GiaNuoc', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập giá nước"
                                                />
                                            </label>
                                            <label className="space-y-2 text-sm text-gray-700">
                                                Tiền nợ khác
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.TienNoKhac}
                                                    onChange={(e) => handleChange('TienNoKhac', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                                    placeholder="Nhập nợ khác"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {preview && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-xs text-gray-500">Tỷ lệ hoàn cọc</p>
                                                    <p className="font-semibold text-gray-900">{Math.round(preview.refundMeta.ratio * 100)}%</p>
                                                    <p className="text-sm text-gray-600">{preview.refundMeta.reason}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Số tiền hoàn cọc</p>
                                                    <p className="font-semibold text-gray-900">{formatCurrency(preview.refundAmount)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500">Tổng khoản khấu trừ</p>
                                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(preview.totalDeductions)}</p>
                                            </div>

                                            <div className="mt-4 overflow-x-auto">
                                                <table className="w-full text-left text-sm text-gray-700">
                                                    <thead>
                                                        <tr className="border-b border-gray-200 bg-white">
                                                            <th className="px-3 py-2">Khoản khấu trừ</th>
                                                            <th className="px-3 py-2">Số tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {preview.deductionRows.map((row) => (
                                                            <tr key={row.label} className="border-b border-gray-100">
                                                                <td className="px-3 py-2">{row.label}</td>
                                                                <td className="px-3 py-2 font-semibold">{formatCurrency(row.value)}</td>
                                                            </tr>
                                                        ))}
                                                        {preview.deductionRows.length === 0 && (
                                                            <tr>
                                                                <td colSpan="2" className="px-3 py-3 text-sm text-gray-500">
                                                                    Chưa có khoản khấu trừ nào. Vui lòng nhập giá điện, giá nước hoặc nợ khác.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm">
                                                Chênh lệch hoàn cọc: {' '}
                                                <span className={preview.difference >= 0 ? 'text-green-700' : 'text-red-700'}>
                                                    {formatCurrency(preview.difference)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCreateReconciliation}
                                        disabled={isLoading || !selectedCandidate}
                                        className="w-full rounded bg-[#2A754B] px-4 py-3 text-white transition hover:bg-[#235d3e] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Lập bảng đối soát'}
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
