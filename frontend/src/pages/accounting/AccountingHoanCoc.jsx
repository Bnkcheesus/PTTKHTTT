import React, { useEffect, useState } from 'react';
import AccountingNavbar from '../../components/AccountingNavbar';
import reconciliationService from '../../services/reconciliationService';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value || 0);
};

export default function AccountingHoanCoc() {
    const [refunds, setRefunds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadRefunds = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await reconciliationService.getAccountingRefunds();
            setRefunds(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách hoàn cọc.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRefunds();
    }, []);

    const handleConfirmRefund = async (maBang) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await reconciliationService.confirmRefundPayment(maBang);
            setMessage(`Đã xác nhận hoàn cọc cho phiếu ${maBang}.`);
            await loadRefunds();
        } catch (err) {
            setError(err.response?.data?.message || 'Xác nhận hoàn cọc thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AccountingNavbar />
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800">Hoàn cọc</h2>
                    <p className="mt-2 text-gray-600">
                        Danh sách phiếu đối soát đã được nhân viên kinh doanh thanh lý hợp đồng và gửi yêu cầu hoàn cọc.
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
                            <h3 className="text-xl font-semibold text-gray-800">Phiếu chờ hoàn cọc</h3>
                            <p className="text-sm text-gray-500">Có {refunds.length} phiếu cần xử lý.</p>
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
                                    <th className="px-3 py-3">Hình thức</th>
                                    <th className="px-3 py-3">Trạng thái</th>
                                    <th className="px-3 py-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refunds.length > 0 ? (
                                    refunds.map((item) => (
                                        <tr key={item.MaBang} className="border-b border-gray-100">
                                            <td className="px-3 py-3 font-medium text-gray-900">{item.MaBang}</td>
                                            <td className="px-3 py-3">{item.MaHopDong || 'N/A'}</td>
                                            <td className="px-3 py-3">{item.HoTen || 'N/A'}</td>
                                            <td className="px-3 py-3">{item.MaPhong || 'N/A'}</td>
                                            <td className="px-3 py-3 font-semibold text-green-700">{formatCurrency(item.SoTienHoanCoc)}</td>
                                            <td className="px-3 py-3">{item.HinhThucHoanCoc}</td>
                                            <td className="px-3 py-3">{item.TrangThaiHoanCoc}</td>
                                            <td className="px-3 py-3">
                                                <button
                                                    onClick={() => handleConfirmRefund(item.MaBang)}
                                                    disabled={isLoading}
                                                    className="rounded bg-[#2A754B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#235d3e] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Xác nhận hoàn cọc
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-3 py-4 text-sm text-gray-500">
                                            Không có phiếu nào chờ hoàn cọc.
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
