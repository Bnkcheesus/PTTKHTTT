import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SaleNavbar from '../../components/SaleNavbar';
import phieuTraPhongService from '../../services/phieuTraPhongService';
import { useAuth } from '../../context/AuthContext';

const TraPhong = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [ngayTraPhong, setNgayTraPhong] = useState('');
    const [tinhTrangHD, setTinhTrangHD] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [newVoucherId, setNewVoucherId] = useState('');
    const [thongBao, setThongBao] = useState({ hienThi: false, noiDung: '', loai: '' });

    // Search filter state
    const [filterMaHD, setFilterMaHD] = useState('');
    const [filterTenKhach, setFilterTenKhach] = useState('');
    const [filterMaPhong, setFilterMaPhong] = useState('');
    const [filterSDT, setFilterSDT] = useState('');
    const [filteredContracts, setFilteredContracts] = useState([]);

    useEffect(() => {
        loadContracts();
    }, []);

    useEffect(() => {
        setFilteredContracts(contracts);
    }, [contracts]);

    const loadContracts = async () => {
        try {
            const data = await phieuTraPhongService.getContractsForReturn();
            setContracts(data);
        } catch (err) {
            setThongBao({ hienThi: true, noiDung: 'Lỗi tải danh sách phiếu đặt cọc', loai: 'error' });
        }
    };

    const handleSearch = () => {
        const result = contracts.filter(c => {
            const matchHD = !filterMaHD || (c.MaHopDong || '').toLowerCase().includes(filterMaHD.toLowerCase());
            const matchTen = !filterTenKhach || (c.HoTen || '').toLowerCase().includes(filterTenKhach.toLowerCase());
            const matchPhong = !filterMaPhong || (c.MaPhong || '').toLowerCase().includes(filterMaPhong.toLowerCase());
            const matchSDT = !filterSDT || (c.SDT || '').includes(filterSDT);
            return matchHD && matchTen && matchPhong && matchSDT;
        });
        setFilteredContracts(result);
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleCreateReturnVoucher = async () => {
        if (!selectedContract) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng chọn phiếu đặt cọc', loai: 'error' });
            return;
        }
        if (!ngayTraPhong) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng chọn ngày trả phòng', loai: 'error' });
            return;
        }
        if (!tinhTrangHD.trim()) {
            setThongBao({ hienThi: true, noiDung: 'Vui lòng nhập tình trạng hợp đồng', loai: 'error' });
            return;
        }

        setLoading(true);
        try {
            const result = await phieuTraPhongService.createReturnVoucher(
                selectedContract.MaPhieuDatCoc,
                ngayTraPhong,
                tinhTrangHD,
                user?.MaNV
            );

            if (result.success || result.MaPhieuTra) {
                setNewVoucherId(result.MaPhieuTra);
                setIsSuccess(true);
            }
        } catch (err) {
            setThongBao({ hienThi: true, noiDung: err.response?.data?.error || 'Lỗi tạo phiếu trả phòng', loai: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setIsSuccess(false);
        setSelectedContract(null);
        setNgayTraPhong('');
        setTinhTrangHD('');
        setThongBao({ hienThi: false, noiDung: '', loai: '' });
        loadContracts();
    };

    const handleCancel = () => {
        navigate('/trang-chu');
    };

    // Success screen
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-100">
                <SaleNavbar />
                <div className="p-8 max-w-[800px] mx-auto">
                    <div className="bg-white rounded shadow-sm">
                        {/* Header */}
                        <div className="bg-[#237850] text-white p-4 text-center font-bold text-lg rounded-t">
                            Tạo phiếu trả phòng thành công
                        </div>

                        {/* Content */}
                        <div className="p-12 text-center">
                            <p className="text-gray-800 mb-8">
                                <span>Mã phiếu trả phòng: </span>
                                <span style={{ color: '#5fed8d' }} className="font-bold text-xl">{newVoucherId}</span>
                            </p>

                            <div className="space-y-3 text-gray-700 mb-8">
                                <p>Tên khách: {selectedContract?.HoTen}</p>
                                <p>Mã phiếu đặt cọc: {selectedContract?.MaPhieuDatCoc}</p>
                                <p>Mã hợp đồng: {selectedContract?.MaHopDong}</p>
                                <p>Ngày trả: {formatDateForDisplay(ngayTraPhong)}</p>
                                <p>Tình trạng: {tinhTrangHD}</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-6 justify-center">
                                <button
                                    onClick={handleCancel}
                                    className="bg-[#3c3836] text-white px-8 py-2 font-bold text-sm rounded hover:bg-[#2a2622] transition-colors"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{ backgroundColor: '#237850' }}
                                    className="text-white px-8 py-2 font-bold text-sm rounded hover:opacity-90 transition-opacity"
                                >
                                    Tiếp tục
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
                {/* Notifications */}
                {thongBao.hienThi && (
                    <div className={`mb-6 p-4 rounded-lg ${thongBao.loai === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {thongBao.noiDung}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-8">
                    {/* LEFT: Contract information */}
                    <div className="col-span-2">
                        <h2 className="font-bold mb-4">Thông tin khách hàng và phiếu đặt cọc</h2>
                        <div className="p-4 rounded shadow-sm mb-8" style={{ backgroundColor: '#d9ead3' }}>
                            {/* Search bar */}
                            <div className="flex border border-gray-400 bg-white mb-2">
                                <input
                                    value={filterMaHD}
                                    onChange={(e) => setFilterMaHD(e.target.value)}
                                    placeholder="Mã hợp đồng"
                                    className="p-2 border-r border-gray-400 w-1/4 outline-none text-xs"
                                />
                                <input
                                    value={filterTenKhach}
                                    onChange={(e) => setFilterTenKhach(e.target.value)}
                                    placeholder="Tên khách"
                                    className="p-2 border-r border-gray-400 w-1/4 outline-none text-xs"
                                />
                                <input
                                    value={filterMaPhong}
                                    onChange={(e) => setFilterMaPhong(e.target.value)}
                                    placeholder="Mã phòng"
                                    className="p-2 border-r border-gray-400 w-1/4 outline-none text-xs"
                                />
                                <input
                                    value={filterSDT}
                                    onChange={(e) => setFilterSDT(e.target.value)}
                                    placeholder="SDT"
                                    className="p-2 w-1/4 outline-none text-xs"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-[#3c3836] text-white px-4 text-xs font-bold whitespace-nowrap"
                                >
                                    Tìm
                                </button>
                            </div>

                            {/* Table */}
                            <div className="bg-white border border-gray-400 max-h-[250px] overflow-y-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2 border-r border-b border-gray-300 text-left font-semibold">Mã PDC</th>
                                            <th className="p-2 border-r border-b border-gray-300 text-left font-semibold">Mã HĐ</th>
                                            <th className="p-2 border-r border-b border-gray-300 text-left font-semibold">Tên khách</th>
                                            <th className="p-2 border-r border-b border-gray-300 text-left font-semibold">Mã phòng</th>
                                            <th className="p-2 border-r border-b border-gray-300 text-left font-semibold">SDT</th>
                                            <th className="p-2 border-r border-b border-gray-300 text-left font-semibold">Ngày bắt đầu</th>
                                            <th className="p-2 border-b border-gray-300 text-center font-semibold">Chọn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredContracts.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-2 text-center text-gray-500">
                                                    Không có phiếu đặt cọc cần trả phòng
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredContracts.map((contract, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={`border-b border-gray-300 cursor-pointer hover:bg-green-50 ${selectedContract?.MaPhieuDatCoc === contract.MaPhieuDatCoc ? 'bg-green-100' : ''
                                                        }`}
                                                    onClick={() =>
                                                        setSelectedContract(
                                                            selectedContract?.MaPhieuDatCoc === contract.MaPhieuDatCoc ? null : contract
                                                        )
                                                    }
                                                >
                                                    <td className="p-2 border-r border-gray-300 font-medium">{contract.MaPhieuDatCoc}</td>
                                                    <td className={`p-2 border-r border-gray-300 ${contract.MaHopDong === 'Không có' ? 'text-gray-400 italic' : ''}`}>
                                                        {contract.MaHopDong}
                                                    </td>
                                                    <td className="p-2 border-r border-gray-300">{contract.HoTen}</td>
                                                    <td className="p-2 border-r border-gray-300">{contract.MaPhong}</td>
                                                    <td className="p-2 border-r border-gray-300">{contract.SDT}</td>
                                                    <td className="p-2 border-r border-gray-300">
                                                        {contract.NgayBatDau ? formatDateForDisplay(contract.NgayBatDau) : <span className="text-gray-400 italic">Không có</span>}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedContract?.MaPhieuDatCoc === contract.MaPhieuDatCoc}
                                                            onChange={() =>
                                                                setSelectedContract(
                                                                    selectedContract?.MaPhieuDatCoc === contract.MaPhieuDatCoc ? null : contract
                                                                )
                                                            }
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

                        {/* Contract details if selected */}
                        {selectedContract && (
                            <div>
                                <h2 className="font-bold mb-4">Chi tiết phiếu đặt cọc</h2>
                                <div className="p-4 rounded shadow-sm" style={{ backgroundColor: '#f5f5f5' }}>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <p className="font-semibold text-gray-700">Mã phiếu đặt cọc</p>
                                            <p className="text-gray-600">{selectedContract.MaPhieuDatCoc}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Mã hợp đồng</p>
                                            <p className={selectedContract.MaHopDong === 'Không có' ? 'text-gray-400 italic' : 'text-gray-600'}>
                                                {selectedContract.MaHopDong}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Tên khách hàng</p>
                                            <p className="text-gray-600">{selectedContract.HoTen}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">SDT</p>
                                            <p className="text-gray-600">{selectedContract.SDT}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Ngày bắt đầu</p>
                                            <p className="text-gray-600">
                                                {selectedContract.NgayBatDau ? formatDateForDisplay(selectedContract.NgayBatDau) : <span className="italic text-gray-400">Không có</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Ngày kết thúc</p>
                                            <p className="text-gray-600">
                                                {selectedContract.NgayKetThuc ? formatDateForDisplay(selectedContract.NgayKetThuc) : <span className="italic text-gray-400">Không có</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Mã phòng</p>
                                            <p className="text-gray-600">{selectedContract.MaPhong}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Input fields */}
                    <div className="col-span-1">
                        <h2 className="font-bold mb-4 text-right">Tạo phiếu trả phòng</h2>
                        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: '#f5f5f5' }}>
                            {/* Return date */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-800 mb-3">
                                    Ngày trả phòng
                                </label>
                                <input
                                    type="date"
                                    value={ngayTraPhong}
                                    onChange={(e) => setNgayTraPhong(e.target.value)}
                                    className="w-full border-b-2 border-gray-800 bg-transparent outline-none text-xs p-1"
                                />
                            </div>

                            {/* Contract condition */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-800 mb-3">
                                    Tình trạng hợp đồng
                                </label>
                                <textarea
                                    value={tinhTrangHD}
                                    onChange={(e) => setTinhTrangHD(e.target.value.slice(0, 200))}
                                    placeholder="Nhập tình trạng..."
                                    maxLength="200"
                                    rows="4"
                                    className="w-full p-2 border border-gray-400 bg-white outline-none text-xs resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {tinhTrangHD.length}/200
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="bg-[#3c3836] hover:bg-[#2a2622] disabled:bg-gray-400 text-white px-6 py-2 text-xs font-bold rounded shadow"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCreateReturnVoucher}
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
        </div>
    );
};

export default TraPhong;