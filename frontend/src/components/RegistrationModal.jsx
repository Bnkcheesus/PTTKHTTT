import React, { useState } from 'react';

const RegistrationModal = ({ moHopThoai, phongDangChon, dongHopThoai, xacNhanDangKy }) => {
    // Các biến lưu trữ dữ liệu nhân viên nhập vào
    const [hoTen, setHoTen] = useState('');
    const [cccd, setCccd] = useState('');
    const [gioiTinh, setGioiTinh] = useState('Nam');
    const [gioiTinhKhac, setGioiTinhKhac] = useState('');
    const [sdt, setSdt] = useState('');
    const [email, setEmail] = useState('');
    const [nhuCau, setNhuCau] = useState('Nguyên phòng');
    const [soNguoiChung, setSoNguoiChung] = useState(0);

    if (!moHopThoai) return null;

    // Xử lý trước khi gửi
    const handleXacNhan = () => {
        if (!hoTen || !cccd || !sdt) {
            alert("Vui lòng nhập đầy đủ Họ tên, CCCD và Số điện thoại!");
            return;
        }

        // Đóng gói dữ liệu thành 1 cục (payload)
        const payload = {
            HoTen: hoTen,
            CCCD: cccd,
            GioiTinh: gioiTinh === 'Khác' ? gioiTinhKhac : gioiTinh,
            SDT: sdt,
            Email: email,
            
            // --- SỬA Ở ĐÂY: Gửi nhiều tên biến để rào lỗi Backend không nhận được ---
            HinhThucThue: nhuCau,  // Tên chuẩn theo Database
            hinhThucThue: nhuCau,  // Tên kiểu camelCase (nếu backend là Nodejs)
            NhuCau: nhuCau,        // Dự phòng
            nhuCauThue: nhuCau,    // Dự phòng
            // -----------------------------------------------------------------------

            SoNguoiDuKien: nhuCau === 'Nguyên phòng' ? 1 + Number(soNguoiChung) : 1,
            MaPhong: phongDangChon?.MaPhong,
            KhoangGia: phongDangChon?.GiaThuePhong 
        };

        xacNhanDangKy(payload);
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[100]">
            <div className="bg-white w-[650px] rounded shadow-2xl overflow-hidden">
                
                <div className="bg-[#333333] text-white text-center py-3 font-bold text-lg">
                    Điền thông tin người đăng ký
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Họ và tên*</label>
                            <input type="text" value={hoTen} onChange={(e) => setHoTen(e.target.value)} className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">CCCD*</label>
                            <input type="text" value={cccd} onChange={(e) => setCccd(e.target.value)} className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-800 mb-2">Giới tính*</label>
                            <div className="flex items-center gap-4 text-sm">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="gioitinh" checked={gioiTinh === 'Nam'} onChange={() => setGioiTinh('Nam')} className="w-4 h-4 accent-[#2A754B]" /> Nam
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="gioitinh" checked={gioiTinh === 'Nữ'} onChange={() => setGioiTinh('Nữ')} className="w-4 h-4 accent-[#2A754B]" /> Nữ
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gioitinh" checked={gioiTinh === 'Khác'} onChange={() => setGioiTinh('Khác')} className="w-4 h-4 accent-[#2A754B]" /> Khác:
                                    <input type="text" value={gioiTinhKhac} onChange={(e) => { setGioiTinh('Khác'); setGioiTinhKhac(e.target.value); }} disabled={gioiTinh !== 'Khác'} className="border border-gray-400 p-1 rounded w-24 outline-none focus:border-[#2A754B]" />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Số điện thoại*</label>
                            <input type="text" value={sdt} onChange={(e) => setSdt(e.target.value)} className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-800 mb-2">Nhu cầu thuê*</label>
                            <div className="flex items-center gap-6 text-sm">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="nhucau" checked={nhuCau === 'Ở ghép'} onChange={() => setNhuCau('Ở ghép')} className="w-4 h-4 accent-[#2A754B]" /> Ở ghép
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="nhucau" checked={nhuCau === 'Nguyên phòng'} onChange={() => setNhuCau('Nguyên phòng')} className="w-4 h-4 accent-[#2A754B]" /> Nguyên phòng
                                </label>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-800 mb-1">Số lượng người thuê chung khác*</label>
                            <input type="number" value={soNguoiChung} onChange={(e) => setSoNguoiChung(e.target.value)} min="0" className="border border-gray-400 p-2 rounded w-20 outline-none focus:border-[#2A754B]" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 flex justify-end gap-3 bg-white border-t border-gray-200">
                    <button onClick={dongHopThoai} className="bg-[#D1D5DB] text-gray-800 px-6 py-2 font-bold border border-gray-400 rounded hover:bg-gray-300 transition-colors">
                        Huỷ
                    </button>
                    {/* Đã sửa gọi hàm handleXacNhan ở đây */}
                    <button onClick={handleXacNhan} className="bg-[#2A754B] text-white px-6 py-2 font-bold rounded hover:bg-green-800 transition-colors">
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;