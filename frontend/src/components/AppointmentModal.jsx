import React, { useState } from 'react';

const AppointmentModal = ({ moHopThoai, khachDangChon, dongHopThoai, xacNhanHenLich }) => {
    // Thêm State để lưu dữ liệu người dùng nhập
    const [ngayHen, setNgayHen] = useState('');
    const [gioHen, setGioHen] = useState('');
    const [xacNhanHopLe, setXacNhanHopLe] = useState(false);

    if (!moHopThoai) return null;

    // Hàm xử lý trước khi gọi ra API ngoài
    const handleXacNhan = () => {
        if (!ngayHen || !gioHen) {
            alert("Vui lòng chọn đầy đủ Ngày hẹn và Giờ hẹn!");
            return;
        }
        if (!xacNhanHopLe) {
            alert("Vui lòng đánh dấu xác nhận tính hợp lệ của phòng!");
            return;
        }

        const thoiGianGop = `${ngayHen} ${gioHen}:00`; 
        xacNhanHenLich(thoiGianGop);
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[100]">
            <div className="bg-white w-[650px] rounded shadow-2xl overflow-hidden">
                <div className="bg-[#333333] text-white text-center py-3 font-bold text-lg">
                    Điền thông tin lịch hẹn mới
                </div>

                <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-base">Thông tin khách hàng:</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Các ô thông tin khách (chỉ đọc) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Họ và tên</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.HoTen || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">CCCD</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.CCCD || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Giới tính</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.GioiTinh || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                        <div className="col-span-1 hidden"></div> 
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Số điện thoại</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.SDT || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.Email || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Phòng đăng ký</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.MaPhong || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Nhu cầu thuê</label>
                            <input type="text" readOnly defaultValue={khachDangChon?.HinhThucThue || ""} className="w-full border border-gray-400 bg-gray-300 p-2 rounded outline-none text-gray-700" />
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 text-base">Thông tin lịch hẹn:</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Ngày hẹn*</label>
                            <input 
                                type="date" 
                                value={ngayHen}
                                onChange={(e) => setNgayHen(e.target.value)}
                                className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Giờ hẹn*</label>
                            <input 
                                type="time" 
                                value={gioHen}
                                onChange={(e) => setGioHen(e.target.value)}
                                className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 ml-2">
                        <input 
                            type="checkbox" 
                            checked={xacNhanHopLe}
                            onChange={(e) => setXacNhanHopLe(e.target.checked)}
                            className="w-5 h-5 accent-[#2A754B] cursor-pointer" 
                        />
                        <label className="text-gray-700 text-sm">Tôi đã trực tiếp xác nhận tính hợp lệ của phòng*</label>
                    </div>
                </div>

                <div className="px-6 py-4 flex justify-end gap-3 bg-white mt-2 border-t border-gray-200">
                    <button 
                        onClick={dongHopThoai}
                        className="bg-[#D1D5DB] text-gray-800 px-6 py-2 font-bold border border-gray-400 rounded hover:bg-gray-300 transition-colors"
                    >
                        Huỷ
                    </button>
                    <button 
                        onClick={handleXacNhan} // Gọi hàm nội bộ để gộp thời gian trước
                        className="bg-[#2A754B] text-white px-6 py-2 font-bold rounded hover:bg-green-800 transition-colors"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;