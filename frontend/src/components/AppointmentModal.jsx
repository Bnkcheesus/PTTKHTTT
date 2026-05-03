import React, { useState, useEffect } from 'react';

const AppointmentModal = ({ moHopThoai, khachDangChon, dongHopThoai, xacNhanHenLich }) => {
    const [ngayHen, setNgayHen] = useState('');
    const [gioHen, setGioHen] = useState('');
    const [daXacNhanHopLe, setDaXacNhanHopLe] = useState(false);

    // Reset form khi mở lại Modal
    useEffect(() => {
        if (moHopThoai) {
            setNgayHen('');
            setGioHen('');
            setDaXacNhanHopLe(false);
        }
    }, [moHopThoai]);

    if (!moHopThoai || !khachDangChon) return null;

    const XuLyXacNhan = () => {
        // Ngoại lệ 1: Thiếu ngày giờ
        if (!ngayHen || !gioHen) {
            alert("Vui lòng chọn đầy đủ Ngày hẹn và Giờ hẹn!");
            return;
        }

        // Ngoại lệ 2: Chưa tích checkbox trách nhiệm
        if (!daXacNhanHopLe) {
            alert("Vui lòng tích vào ô xác nhận tính hợp lệ của phòng!");
            return;
        }

        // Ngoại lệ 3: Hẹn lịch trong quá khứ
        const thoiGianHen = new Date(`${ngayHen}T${gioHen}`);
        const thoiGianHienTai = new Date();
        if (thoiGianHen < thoiGianHienTai) {
            alert("Thời gian hẹn không hợp lệ (không được chọn thời gian trong quá khứ)!");
            return;
        }

        // Nếu qua hết các ải, gọi hàm Xác nhận lên Trang cha
        // Format ISO String chuẩn cho SQL Server: YYYY-MM-DDTHH:MM:SS
        xacNhanHenLich(`${ngayHen}T${gioHen}:00.000Z`, khachDangChon.MaPhieuYC);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-[600px] shadow-2xl relative">
                {/* Header */}
                <div className="bg-[#333333] text-white text-center py-3 font-semibold text-lg">
                    Điền thông tin lịch hẹn mới
                </div>

                <div className="p-6">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Thông tin khách hàng:</h3>
                    
                    {/* Phần Read-only bôi xám */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Họ và tên</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.HoTen || ''} />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">CCCD</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.CCCD || ''} />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Giới tính</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.GioiTinh || ''} />
                        </div>
                        <div className="hidden"></div> {/* Empty div to align grid */}
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Số điện thoại</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.SDT || ''} />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Email</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.Email || ''} />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Phòng đăng ký</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.MaPhong || ''} />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Nhu cầu thuê</label>
                            <input type="text" readOnly className="w-full border border-gray-400 p-2 rounded bg-gray-300 text-gray-700 outline-none" value={khachDangChon.HinhThucThue || ''} />
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Thông tin lịch hẹn:</h3>
                    
                    {/* Phần nhập liệu mới */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Ngày hẹn*</label>
                            <input type="date" className="w-full border border-gray-400 p-2 rounded outline-none focus:border-green-700 cursor-pointer" 
                                value={ngayHen} onChange={(e) => setNgayHen(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Giờ hẹn*</label>
                            <input type="time" className="w-full border border-gray-400 p-2 rounded outline-none focus:border-green-700 cursor-pointer" 
                                value={gioHen} onChange={(e) => setGioHen(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                            <input type="checkbox" className="w-4 h-4 accent-green-700" 
                                checked={daXacNhanHopLe} onChange={(e) => setDaXacNhanHopLe(e.target.checked)} 
                            />
                            Tôi đã trực tiếp xác nhận tính hợp lệ của phòng*
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={dongHopThoai} className="bg-gray-300 text-black px-6 py-2 rounded font-semibold hover:bg-gray-400 transition-colors">
                            Huỷ
                        </button>
                        <button 
                            onClick={XuLyXacNhan} 
                            disabled={!daXacNhanHopLe} // Vô hiệu hóa nếu chưa check
                            className={`px-6 py-2 rounded font-semibold transition-colors shadow-md 
                                ${daXacNhanHopLe ? 'bg-[#2A754B] text-white hover:bg-green-800 cursor-pointer' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;