import React, { useState, useEffect } from 'react';
import ManagerNavbar from '../../components/ManagerNavbar';
import depositService from '../../services/depositService';

export default function DepositsManagement() {
    const [paidDeposits, setPaidDeposits] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchInputs, setSearchInputs] = useState({
        maPhieu: '', ten: '', ngayLap: '', maNhom: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await depositService.getPaidDeposits();
            setPaidDeposits(data || []);
        } catch (err) {
            setError('Lỗi khi tải dữ liệu: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return alert("Vui lòng chọn ít nhất một phiếu!");
        try {
            await Promise.all(selectedIds.map(id => depositService.approveDeposit(id)));
            setSuccessMessage('Duyệt thành công các phiếu đã chọn!');
            setSelectedIds([]);
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Lỗi khi duyệt đơn: ' + err.message);
        }
    };

    const handleBulkReject = async () => {
        if (selectedIds.length === 0) return alert("Vui lòng chọn ít nhất một phiếu!");
        try {
            await Promise.all(selectedIds.map(id => depositService.rejectDeposit(id)));
            setSuccessMessage('Đã từ chối các phiếu đã chọn!');
            setSelectedIds([]);
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Lỗi khi từ chối đơn: ' + err.message);
        }
    };

    const handleSearchChange = (e, field) => {
        setSearchInputs(prev => ({ ...prev, [field]: e.target.value }));
    };

    const filteredDeposits = paidDeposits.filter(deposit => {
        return (deposit.MaPhieuDatCoc || '').toLowerCase().includes(searchInputs.maPhieu.toLowerCase()) &&
            (deposit.HoTen || '').toLowerCase().includes(searchInputs.ten.toLowerCase()) &&
            (deposit.NgayLap || '').includes(searchInputs.ngayLap) &&
            (deposit.MaNhom || '').toLowerCase().includes(searchInputs.maNhom.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar container */}
            <div style={{ backgroundColor: '#237850' }}>
                <ManagerNavbar />
            </div>

            <div className="p-8 max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin đặt cọc của khách</h2>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{error}</div>}
                {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">{successMessage}</div>}

                {/* Light Green Box */}
                <div className="p-6 rounded-md shadow-sm" style={{ backgroundColor: '#d9ead3' }}>

                    {/* Search Inputs Row */}
                    <div className="flex gap-0 mb-4 items-center">
                        <input
                            type="text"
                            placeholder="Mã phiếu đặt cọc"
                            className="flex-1 p-2 border border-gray-400 bg-white outline-none"
                            value={searchInputs.maPhieu}
                            onChange={(e) => handleSearchChange(e, 'maPhieu')}
                        />
                        <input
                            type="text"
                            placeholder="Tên khách"
                            className="flex-1 p-2 border border-gray-400 border-l-0 bg-white outline-none"
                            value={searchInputs.ten}
                            onChange={(e) => handleSearchChange(e, 'ten')}
                        />
                        <input
                            type="text"
                            placeholder="Ngày lập phiếu"
                            className="flex-1 p-2 border border-gray-400 border-l-0 bg-white outline-none"
                            value={searchInputs.ngayLap}
                            onChange={(e) => handleSearchChange(e, 'ngayLap')}
                        />
                        <input
                            type="text"
                            placeholder="Mã nhóm"
                            className="flex-1 p-2 border border-gray-400 border-l-0 bg-white outline-none"
                            value={searchInputs.maNhom}
                            onChange={(e) => handleSearchChange(e, 'maNhom')}
                        />
                        <button className="bg-stone-700 text-white px-8 py-2 font-bold ml-4 rounded-md hover:bg-stone-800 shadow-md">
                            Tìm
                        </button>
                    </div>

                    {/* Table with Scrollbar */}
                    {/* max-h-[400px] controls how tall the table is before it starts scrolling */}
                    <div className="bg-white border border-gray-400 max-h-[450px] overflow-y-auto custom-scrollbar">
                        <table className="w-full border-collapse table-fixed">
                            <tbody className="divide-y divide-gray-300">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-10 text-center">Đang tải dữ liệu...</td></tr>
                                ) : filteredDeposits.length > 0 ? (
                                    filteredDeposits.map((deposit) => (
                                        <tr key={deposit.MaPhieuDatCoc} className="hover:bg-gray-50">
                                            <td className="p-3 border-r border-gray-300 w-1/4 text-sm truncate">{deposit.MaPhieuDatCoc}</td>
                                            <td className="p-3 border-r border-gray-300 w-1/4 text-sm truncate">{deposit.HoTen || '-'}</td>
                                            <td className="p-3 border-r border-gray-300 w-1/4 text-sm truncate">{deposit.NgayLap || '-'}</td>
                                            <td className="p-3 border-r border-gray-300 w-1/4 text-sm truncate">{deposit.MaNhom || 'Không có'}</td>
                                            <td className="p-3 text-center w-16">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 accent-green-700 cursor-pointer"
                                                    checked={selectedIds.includes(deposit.MaPhieuDatCoc)}
                                                    onChange={() => handleCheckboxChange(deposit.MaPhieuDatCoc)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="p-10 text-center italic text-gray-500">Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-10 mt-10">
                    <button
                        onClick={handleBulkReject}
                        className="bg-stone-700 text-white px-10 py-3 rounded-md font-bold hover:bg-stone-800 transition shadow-lg text-lg"
                    >
                        Không chấp thuận
                    </button>
                    <button
                        onClick={handleBulkApprove}
                        style={{ backgroundColor: '#237850' }}
                        className="text-white px-16 py-3 rounded-md font-bold hover:opacity-90 transition shadow-lg text-lg"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>

            {/* Custom Scrollbar Styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}} />
        </div>
    );
}