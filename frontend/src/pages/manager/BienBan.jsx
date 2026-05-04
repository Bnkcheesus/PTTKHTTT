import React, { useState, useEffect } from 'react';
import ManagerNavbar from '../../components/ManagerNavbar';
import bienBanService from '../../services/bienBanService';
import { useAuth } from '../../context/AuthContext';

export default function BienBan() {
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [selectedHD, setSelectedHD] = useState(null);
    const [selectedTB, setSelectedTB] = useState(null);
    const [details, setDetails] = useState([]);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const [cData, eData] = await Promise.all([
            bienBanService.getContracts(),
            bienBanService.getEquipments()
        ]);
        setContracts(cData);
        setEquipments(eData);
    };

    const handleSelectHD = async (id) => {
        setSelectedHD(id);
        await bienBanService.initBienBan(id, user?.MaNV); // Pass employee MaNV
        const detailData = await bienBanService.getDetails(id);
        setDetails(detailData);
    };

    const handleAddItem = async () => {
        if (!selectedHD || !selectedTB) return alert("Vui lòng chọn Hợp đồng và Thiết bị!");
        try {
            await bienBanService.addItem(selectedHD, selectedTB, parseInt(qty));
            const detailData = await bienBanService.getDetails(selectedHD);
            setDetails(detailData);
            setSelectedTB(null);
            setQty(1);
        } catch (err) { alert("Lỗi: Thiết bị có thể đã tồn tại trong biên bản."); }
    };

    const handleRemoveItem = async (maTB) => {
        await bienBanService.removeItem(selectedHD, maTB);
        const detailData = await bienBanService.getDetails(selectedHD);
        setDetails(detailData);
    };

    const handleConfirm = async () => {
        if (!selectedHD || details.length === 0) {
            return alert("Vui lòng thêm ít nhất một thiết bị vào biên bản!");
        }
        alert("Biên bản đã được lưu thành công!");
        resetUI();
    };

    const handleCancel = async () => {
        if (!selectedHD) return;
        try {
            console.log('Canceling bien ban for:', selectedHD);
            await bienBanService.deleteBienBan(selectedHD);
            alert("Biên bản đã được hủy!");
            resetUI();
        } catch (err) {
            console.error('Error deleting bien ban:', err);
            alert("Lỗi khi hủy biên bản: " + (err.message || 'Unknown error'));
        }
    };

    const resetUI = () => {
        setSelectedHD(null);
        setSelectedTB(null);
        setDetails([]);
        setQty(1);
    };

    return (
        <div className="min-h-screen bg-white">
            <ManagerNavbar />

            <div className="p-8 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-2 gap-10">
                    {/* LEFT: Thông tin hợp đồng */}
                    <div>
                        <h2 className="font-bold mb-4">Thông tin hợp đồng của khách</h2>
                        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: '#d9ead3' }}>
                            <div className="flex border border-gray-400 bg-white mb-2">
                                <input placeholder="Mã hợp đồng" className="p-2 border-r border-gray-400 w-1/3 outline-none text-xs" />
                                <input placeholder="Ngày lập hợp đồng" className="p-2 border-r border-gray-400 w-1/3 outline-none text-xs" />
                                <input placeholder="Tên khách hàng" className="p-2 w-1/3 outline-none text-xs" />
                                <button className="bg-[#3c3836] text-white px-4 text-xs font-bold">Tìm</button>
                            </div>
                            <div className="bg-white border border-gray-400 max-h-[200px] overflow-y-auto">
                                <table className="w-full text-xs border-collapse">
                                    <tbody>
                                        {contracts.map(c => (
                                            <tr key={c.MaHopDong} className="border-b border-gray-300">
                                                <td className="p-2 border-r border-gray-300 w-1/3">{c.MaHopDong}</td>
                                                <td className="p-2 border-r border-gray-300 w-1/3">{new Date(c.NgayKy).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-2 border-r border-gray-300 w-1/3">{c.HoTen}</td>
                                                <td className="p-2 text-center">
                                                    <input type="checkbox" checked={selectedHD === c.MaHopDong} onChange={() => handleSelectHD(c.MaHopDong)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Thêm nội dung biên bản */}
                    <div>
                        <h2 className="font-bold mb-4 text-right">Thêm nội dung biên bản</h2>
                        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: '#d9ead3' }}>
                            <div className="flex gap-2 mb-2">
                                <input placeholder="Tên thiết bị" className="flex-1 p-2 border border-gray-400 bg-white outline-none text-xs" />
                                <button className="bg-[#3c3836] text-white px-4 text-xs font-bold rounded">Tìm</button>
                            </div>
                            <div style={{ backgroundColor: 'white' }} className="border border-gray-400 max-h-[150px] overflow-y-auto mb-4">
                                <table className="w-full text-xs">
                                    <tbody>
                                        {equipments.map(e => (
                                            <tr key={e.MaThietBi} className="border-b border-gray-300">
                                                <td className="p-2 border-r border-gray-300">{e.TenThietBi}</td>
                                                <td className="p-2 text-center w-10">
                                                    <input type="checkbox" checked={selectedTB === e.MaThietBi} onChange={() => setSelectedTB(e.MaThietBi)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-4 items-center justify-end">
                                <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-32 p-2 border border-gray-400 bg-white outline-none text-xs" placeholder="Số lượng" />
                                <button onClick={handleAddItem} className="bg-[#3c3836] text-white px-6 py-2 text-xs font-bold rounded shadow">Thêm</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM: Nội dung biên bản hiện tại */}
                <div className="mt-12">
                    <h2 className="font-bold mb-4">Nội dung biên bản</h2>
                    <div className="grid grid-cols-[250px_150px_50px] gap-2 mb-2">
                        <div className="p-2 border border-gray-400 font-bold bg-white text-xs">Tên thiết bị</div>
                        <div className="p-2 border border-gray-400 font-bold bg-white text-xs">Số lượng</div>
                        <div></div>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto">
                        {details.map(d => (
                            <div key={d.MaThietBi} className="grid grid-cols-[250px_150px_50px] gap-2 mb-1">
                                <div className="p-2 border border-gray-400 bg-white text-xs">{d.TenThietBi}</div>
                                <div className="p-2 border border-gray-400 bg-white text-xs">{d.SoLuong}</div>
                                <button onClick={() => handleRemoveItem(d.MaThietBi)} className="text-red-500 border border-green-600 flex items-center justify-center font-bold">X</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FINAL BUTTONS */}
                <div className="flex justify-end gap-10 mt-10">
                    <button onClick={handleCancel} className="bg-[#3c3836] text-white px-12 py-3 rounded font-bold shadow-lg">Hủy</button>
                    <button onClick={handleConfirm} style={{ backgroundColor: '#237850' }} className="text-white px-12 py-3 rounded font-bold shadow-lg">Xác nhận</button>
                </div>
            </div>
        </div>
    );
}