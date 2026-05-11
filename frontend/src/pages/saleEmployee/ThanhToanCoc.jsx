import React, { useEffect, useState } from 'react';
import SaleNavbar from '../../components/SaleNavbar';
import depositService from '../../services/depositService';
import reconciliationService from '../../services/reconciliationService';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value || 0);
};

const ThanhToanCoc = () => {
    const [mode, setMode] = useState('deposit');
    const [cccd, setCccd] = useState('');
    const [depositData, setDepositData] = useState(null);
    const [refunds, setRefunds] = useState([]);
    const [hinhThuc, setHinhThuc] = useState('Tiền mặt');
    const [refundMethods, setRefundMethods] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadRefunds = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await reconciliationService.getSalesRefunds();
            setRefunds(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách hồ sơ hoàn cọc.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (mode === 'refund') {
            loadRefunds();
        }
    }, [mode]);

    const handleSearch = async () => {
        setError('');
        setMessage('');

        try {
            const result = await depositService.getInfo(cccd);
            setDepositData(result);
        } catch (err) {
            setError('Không tìm thấy thông tin đặt cọc.');
            setDepositData(null);
        }
    };

    const handlePay = async () => {
        if (!depositData) return;
        setError('');
        setMessage('');

        try {
            const res = await depositService.pay(depositData.MaPhieuDatCoc, hinhThuc);
            if (res.success) {
                setMessage('Ghi nhận thanh toán cọc thành công.');
                setDepositData(null);
                setCccd('');
            }
        } catch (err) {
            setError('Ghi nhận thanh toán cọc thất bại.');
        }
    };

    const handleLiquidate = async (maBang) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await reconciliationService.liquidateContract(maBang);
            setMessage(`Đã thanh lý hợp đồng cho phiếu ${maBang}.`);
            await loadRefunds();
        } catch (err) {
            setError(err.response?.data?.message || 'Thanh lý hợp đồng thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRefund = async (maBang) => {
        const method = refundMethods[maBang] || 'Tiền mặt';
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await reconciliationService.submitRefundRequest(maBang, method);
            setMessage(`Đã gửi yêu cầu hoàn cọc cho kế toán: ${maBang}.`);
            await loadRefunds();
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi yêu cầu hoàn cọc thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <SaleNavbar />
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
                    <button
                        onClick={() => setMode('deposit')}
                        className={`rounded px-5 py-2 text-sm font-semibold ${mode === 'deposit' ? 'bg-[#2A754B] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Đặt cọc
                    </button>
                    <button
                        onClick={() => setMode('refund')}
                        className={`rounded px-5 py-2 text-sm font-semibold ${mode === 'refund' ? 'bg-[#2A754B] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Hoàn cọc
                    </button>
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

                {mode === 'deposit' ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800">Thanh toán đặt cọc</h2>
                            <p className="mt-2 text-gray-600">Ghi nhận tiền đặt cọc ban đầu khi khách vào.</p>
                        </div>

                        <div className="flex gap-2">
                            <input
                                className="w-80 rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                                placeholder="CCCD khách..."
                                value={cccd}
                                onChange={(e) => setCccd(e.target.value)}
                            />
                            <button onClick={handleSearch} className="rounded bg-gray-800 px-6 py-2 text-white">
                                Tìm
                            </button>
                        </div>

                        {depositData && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="grid gap-8 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-3xl font-bold text-[#2A754B]">
                                            {formatCurrency(depositData.TienCoc)}
                                        </h3>
                                        <p className="mt-4">Mã phiếu: <span className="font-semibold">{depositData.MaPhieuDatCoc}</span></p>
                                        <p>Khách hàng: <span className="font-semibold">{depositData.HoTen}</span></p>
                                        <p>Phòng: <span className="font-semibold">{depositData.MaPhong || 'N/A'}</span></p>
                                        <p>Trạng thái: <span className="font-semibold text-red-600">{depositData.TrangThai}</span></p>
                                    </div>
                                    <div>
                                        <p className="mb-2 font-bold">Hình thức thanh toán</p>
                                        <label className="mb-2 block rounded border p-2">
                                            <input type="radio" checked={hinhThuc === 'Tiền mặt'} onChange={() => setHinhThuc('Tiền mặt')} /> Tiền mặt
                                        </label>
                                        <label className="block rounded border p-2">
                                            <input type="radio" checked={hinhThuc === 'Chuyển khoản'} onChange={() => setHinhThuc('Chuyển khoản')} /> Chuyển khoản
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={handlePay} className="rounded bg-[#2A754B] px-8 py-2 font-bold text-white">
                                        Ghi nhận thanh toán
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800">Hoàn cọc</h2>
                            <p className="mt-2 text-gray-600">
                                Hồ sơ có phiếu đối soát đã duyệt và đã có thanh toán phát sinh.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">Hồ sơ chờ hoàn cọc</h3>
                                    <p className="text-sm text-gray-500">Có {refunds.length} hồ sơ cần xử lý.</p>
                                </div>
                                <button
                                    onClick={loadRefunds}
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
                                            <th className="px-3 py-3">Mã HĐ</th>
                                            <th className="px-3 py-3">Khách</th>
                                            <th className="px-3 py-3">Phòng</th>
                                            <th className="px-3 py-3">Tiền hoàn cọc</th>
                                            <th className="px-3 py-3">Thanh lý</th>
                                            <th className="px-3 py-3">Hình thức hoàn</th>
                                            <th className="px-3 py-3">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refunds.length > 0 ? (
                                            refunds.map((item) => {
                                                const isLiquidated = item.TrangThaiThanhLy === 'Đã thanh lý';
                                                return (
                                                    <tr key={item.MaBang} className="border-b border-gray-100">
                                                        <td className="px-3 py-3 font-medium text-gray-900">{item.MaBang}</td>
                                                        <td className="px-3 py-3">{item.MaHopDong || 'N/A'}</td>
                                                        <td className="px-3 py-3">{item.HoTen || 'N/A'}</td>
                                                        <td className="px-3 py-3">{item.MaPhong || 'N/A'}</td>
                                                        <td className="px-3 py-3 font-semibold text-green-700">{formatCurrency(item.SoTienHoanCoc)}</td>
                                                        <td className="px-3 py-3">
                                                            <button
                                                                onClick={() => handleLiquidate(item.MaBang)}
                                                                disabled={isLoading || isLiquidated}
                                                                className="rounded bg-gray-800 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {isLiquidated ? 'Đã thanh lý' : 'Thanh lý hợp đồng'}
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="space-y-1">
                                                                <label className="block">
                                                                    <input
                                                                        type="radio"
                                                                        checked={(refundMethods[item.MaBang] || 'Tiền mặt') === 'Tiền mặt'}
                                                                        onChange={() => setRefundMethods((prev) => ({ ...prev, [item.MaBang]: 'Tiền mặt' }))}
                                                                    /> Tiền mặt
                                                                </label>
                                                                <label className="block">
                                                                    <input
                                                                        type="radio"
                                                                        checked={refundMethods[item.MaBang] === 'Chuyển khoản'}
                                                                        onChange={() => setRefundMethods((prev) => ({ ...prev, [item.MaBang]: 'Chuyển khoản' }))}
                                                                    /> Chuyển khoản
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <button
                                                                onClick={() => handleSubmitRefund(item.MaBang)}
                                                                disabled={isLoading || !isLiquidated}
                                                                className="rounded bg-[#2A754B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#235d3e] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Xác nhận
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-3 py-4 text-sm text-gray-500">
                                                    Không có hồ sơ nào chờ hoàn cọc.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThanhToanCoc;
