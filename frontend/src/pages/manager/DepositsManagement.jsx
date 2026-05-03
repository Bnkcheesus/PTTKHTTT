import React, { useState, useEffect } from 'react';
import ManagerNavbar from '../../components/ManagerNavbar';
import depositService from '../../services/depositService';

export default function DepositsManagement() {
    const [paidDeposits, setPaidDeposits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchInputs, setSearchInputs] = useState({
        maPhieu: '',
        ten: '',
        ngayLap: '',
        maNhom: ''
    });

    // Fetch deposits (Only for "Kiểm tra khách")
    useEffect(() => {
        const fetchDeposits = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await depositService.getPaidDeposits();
                setPaidDeposits(data || []);
            } catch (err) {
                setError('Lỗi khi tải dữ liệu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDeposits();
    }, []);

    const handleApprove = async (maPhieu) => {
        try {
            await depositService.approveDeposit(maPhieu);
            setSuccessMessage('Duyệt đơn thành công!');
            const data = await depositService.getPaidDeposits();
            setPaidDeposits(data || []);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Lỗi khi duyệt đơn: ' + err.message);
        }
    };

    const handleReject = async (maPhieu) => {
        try {
            await depositService.rejectDeposit(maPhieu);
            setSuccessMessage('Từ chối đơn thành công!');
            const data = await depositService.getPaidDeposits();
            setPaidDeposits(data || []);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Lỗi khi từ chối đơn: ' + err.message);
        }
    };

    const handleSearchChange = (e, field) => {
        setSearchInputs(prev => ({ ...prev, [field]: e.target.value }));
    };

    const filterDeposits = (deposits, searchObj) => {
        if (!deposits) return [];
        return deposits.filter(deposit => {
            const maPhieuMatch = (deposit.MaPhieuDatCoc || '').toLowerCase().includes(searchObj.maPhieu.toLowerCase());
            const tenMatch = (deposit.HoTen || '').toLowerCase().includes(searchObj.ten.toLowerCase());
            const ngayLapMatch = (deposit.NgayLap || '').includes(searchObj.ngayLap);
            const maNhomMatch = (deposit.MaNhom || '').toLowerCase().includes(searchObj.maNhom.toLowerCase());
            return maPhieuMatch && tenMatch && ngayLapMatch && maNhomMatch;
        });
    };

    const filteredDeposits = filterDeposits(paidDeposits, searchInputs);

    return (
        <div className="min-h-screen bg-gray-100">
            <ManagerNavbar />

            <div className="p-6">
                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {successMessage}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Thông tin đặt cọc của khách
                    </h2>

                    {/* Search Bar */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Mã phiếu đặt cọc"
                            value={searchInputs.maPhieu}
                            onChange={(e) => handleSearchChange(e, 'maPhieu')}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-700"
                        />
                        <input
                            type="text"
                            placeholder="Tên khách"
                            value={searchInputs.ten}
                            onChange={(e) => handleSearchChange(e, 'ten')}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-700"
                        />
                        <input
                            type="text"
                            placeholder="Ngày lập phiếu"
                            value={searchInputs.ngayLap}
                            onChange={(e) => handleSearchChange(e, 'ngayLap')}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-700"
                        />
                        <input
                            type="text"
                            placeholder="Mã nhóm"
                            value={searchInputs.maNhom}
                            onChange={(e) => handleSearchChange(e, 'maNhom')}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-700"
                        />
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-8">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mã phiếu đặt cọc</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên khách</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ngày lập phiếu</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mã nhóm</th>
                                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDeposits.length > 0 ? (
                                        filteredDeposits.map((deposit) => (
                                            <tr key={deposit.MaPhieuDatCoc} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700">{deposit.MaPhieuDatCoc}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{deposit.HoTen || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{deposit.NgayLap || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{deposit.MaNhom || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleApprove(deposit.MaPhieuDatCoc)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                                        >
                                                            Xác nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(deposit.MaPhieuDatCoc)}
                                                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}