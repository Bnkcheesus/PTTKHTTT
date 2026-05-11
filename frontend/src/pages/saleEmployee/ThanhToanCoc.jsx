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

const getRemainingHours = (dateString) => {
    if (!dateString) return 0;
    const created = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    const hoursPassed = Math.floor(diff / (1000 * 60 * 60));
    return Math.max(0, 24 - hoursPassed);
};

const ThanhToanCoc = () => {
    const [mode, setMode] = useState('deposit');
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadPendingDeposits = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const data = await depositService.getPendingPayments();
            setPendingDeposits(data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách đặt cọc.');
            setPendingDeposits([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRefunds = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const data = await reconciliationService.getSalesRefunds();
            setRefunds(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách hồ sơ hoàn cọc.');
            setRefunds([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (mode === 'deposit') {
            loadPendingDeposits();
        } else {
            loadRefunds();
        }
    }, [mode]);

    const handlePayDeposit = async (maPDC) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const hinhThuc = paymentMethods[maPDC] || 'Tiền mặt';
            await depositService.pay(maPDC, hinhThuc);
            setMessage(`Thanh toán cọc thành công cho ${maPDC}.`);
            await loadPendingDeposits();
        } catch (err) {
            setError(err.response?.data?.error || 'Thanh toán cọc thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelDeposit = async (maPDC) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await depositService.cancel(maPDC);
            setMessage(`Đã hủy phiếu đặt cọc ${maPDC}.`);
            await loadPendingDeposits();
        } catch (err) {
            setError(err.response?.data?.error || 'Hủy đặt cọc thất bại.');
        } finally {
            setIsLoading(false);
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
        const method = paymentMethods[maBang] || 'Tiền mặt';
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
                            <p className="mt-2 text-gray-600">Danh sách phiếu đặt cọc cần thanh toán trong vòng 24 giờ.</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
                            <table className="min-w-full text-left text-sm text-gray-700">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-3 py-3">Mã phiếu</th>
                                        <th className="px-3 py-3">Khách</th>
                                        <th className="px-3 py-3">CCCD</th>
                                        <th className="px-3 py-3">Phòng</th>
                                        <th className="px-3 py-3">Tiền cọc</th>
                                        <th className="px-3 py-3">Người tạo</th>
                                        <th className="px-3 py-3">Hạn thanh toán</th>
                                        <th className="px-3 py-3">Phương thức</th>
                                        <th className="px-3 py-3">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingDeposits.length > 0 ? (
                                        pendingDeposits.map((item) => {
                                            const remainingHours = getRemainingHours(item.NgayLap);
                                            const isExpired = remainingHours <= 0;
                                            return (
                                                <tr key={item.MaPhieuDatCoc} className="border-b border-gray-100">
                                                    <td className="px-3 py-3 font-medium text-gray-900">{item.MaPhieuDatCoc}</td>
                                                    <td className="px-3 py-3">{item.HoTen}</td>
                                                    <td className="px-3 py-3">{item.CCCD}</td>
                                                    <td className="px-3 py-3">{item.MaPhong || 'N/A'}</td>
                                                    <td className="px-3 py-3 font-semibold text-green-700">{formatCurrency(item.TienCoc)}</td>
                                                    <td className="px-3 py-3">{item.MaNV || 'N/A'}</td>
                                                    <td className="px-3 py-3">
                                                        {isExpired ? (
                                                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">Hết hạn</span>
                                                        ) : (
                                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Còn {remainingHours} giờ</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="space-y-1">
                                                            <label className="flex items-center gap-2 text-xs">
                                                                <input
                                                                    type="radio"
                                                                    checked={(paymentMethods[item.MaPhieuDatCoc] || 'Tiền mặt') === 'Tiền mặt'}
                                                                    onChange={() => setPaymentMethods((prev) => ({ ...prev, [item.MaPhieuDatCoc]: 'Tiền mặt' }))}
                                                                />
                                                                Tiền mặt
                                                            </label>
                                                            <label className="flex items-center gap-2 text-xs">
                                                                <input
                                                                    type="radio"
                                                                    checked={paymentMethods[item.MaPhieuDatCoc] === 'Chuyển khoản'}
                                                                    onChange={() => setPaymentMethods((prev) => ({ ...prev, [item.MaPhieuDatCoc]: 'Chuyển khoản' }))}
                                                                />
                                                                Chuyển khoản
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 space-y-2">
                                                        <button
                                                            onClick={() => handlePayDeposit(item.MaPhieuDatCoc)}
                                                            disabled={isLoading || isExpired}
                                                            className="w-full rounded bg-[#2A754B] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Thanh toán
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelDeposit(item.MaPhieuDatCoc)}
                                                            disabled={isLoading}
                                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="p-6 text-center text-gray-500">
                                                Không có phiếu đặt cọc cần thanh toán trong 24 giờ.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                                                                <label className="block text-xs">
                                                                    <input
                                                                        type="radio"
                                                                        checked={(paymentMethods[item.MaBang] || 'Tiền mặt') === 'Tiền mặt'}
                                                                        onChange={() => setPaymentMethods((prev) => ({ ...prev, [item.MaBang]: 'Tiền mặt' }))}
                                                                    /> Tiền mặt
                                                                </label>
                                                                <label className="block text-xs">
                                                                    <input
                                                                        type="radio"
                                                                        checked={paymentMethods[item.MaBang] === 'Chuyển khoản'}
                                                                        onChange={() => setPaymentMethods((prev) => ({ ...prev, [item.MaBang]: 'Chuyển khoản' }))}
                                                                    /> Chuyển khoản
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <button
                                                                onClick={() => handleSubmitRefund(item.MaBang)}
                                                                disabled={isLoading || isLiquidated}
                                                                className="rounded bg-[#2A754B] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Gửi hoàn cọc
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="p-4 text-center text-gray-500">Không có hồ sơ hoàn cọc đang chờ xử lý.</td>
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
