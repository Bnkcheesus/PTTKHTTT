import React, { useState, useEffect } from 'react';

const RoomTable = ({ danhSachPhong, phongDangChon, chonPhong }) => {
    const [timMaPhong, setTimMaPhong] = useState('');
    const [timSoNguoi, setTimSoNguoi] = useState('');
    const [timGiaThue, setTimGiaThue] = useState('');
    const [danhSachHienThi, setDanhSachHienThi] = useState([]);

    useEffect(() => {
        setDanhSachHienThi(danhSachPhong);
    }, [danhSachPhong]);

    const handleTimKiem = () => {
        const ketQua = danhSachPhong.filter(phong => {
            const matchMaPhong = phong.MaPhong?.toLowerCase().includes(timMaPhong.toLowerCase());
            const matchSoNguoi = timSoNguoi === '' || String(phong.SoNguoiThueToiDa) === timSoNguoi;
            
            const rawGiaThueDB = String(phong.GiaThuePhong); 
            const cleanInputGia = timGiaThue.replace(/\D/g, ''); 
            const matchGiaThue = timGiaThue === '' || rawGiaThueDB.includes(cleanInputGia);

            return (timMaPhong === '' || matchMaPhong) && matchSoNguoi && matchGiaThue;
        });
        setDanhSachHienThi(ketQua);
    };

    const formatGiaTien = (tien) => {
        return new Intl.NumberFormat('vi-VN').format(tien) + ' VNĐ/tháng';
    };

    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full text-center border-collapse border border-[#333333] text-gray-300 text-sm">
                <thead>
                    {/* DÒNG TIÊU ĐỀ */}
                    <tr className="bg-[#1A1A1A] text-white">
                        <th className="p-4 border border-[#333333] font-semibold w-16">Chọn</th>
                        <th className="p-4 border border-[#333333] font-semibold">Mã phòng</th>
                        <th className="p-4 border border-[#333333] font-semibold">Số người tối đa</th>
                        <th className="p-4 border border-[#333333] font-semibold">Giá thuê</th>
                        <th className="p-4 border border-[#333333] font-semibold">Tình trạng</th>
                        <th className="p-4 border border-[#333333] font-semibold">Điều kiện thuê</th>
                    </tr>
                    
                    {/* DÒNG TÌM KIẾM THEO ĐÚNG THIẾT KẾ CỦA BÁC */}
                    <tr className="bg-[#141414]">
                        <td className="p-2 border border-[#333333]"></td>
                        <td className="p-2 border border-[#333333]">
                            <input 
                                type="text" 
                                placeholder="Nhập mã phòng" 
                                value={timMaPhong}
                                onChange={(e) => setTimMaPhong(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-400 italic outline-none placeholder-gray-500"
                            />
                        </td>
                        <td className="p-2 border border-[#333333]">
                            <input 
                                type="text" 
                                placeholder="Nhập số người tối đa" 
                                value={timSoNguoi}
                                onChange={(e) => setTimSoNguoi(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-400 italic outline-none placeholder-gray-500"
                            />
                        </td>
                        <td className="p-2 border border-[#333333]">
                            <input 
                                type="text" 
                                placeholder="Nhập giá thuê" 
                                value={timGiaThue}
                                onChange={(e) => setTimGiaThue(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-400 italic outline-none placeholder-gray-500"
                            />
                        </td>
                        <td className="p-2 border border-[#333333]"></td>
                        {/* NÚT TÌM Ở LỀ PHẢI */}
                        <td 
                            className="p-2 border border-[#333333] bg-[#2A2A2A] hover:bg-[#333333] cursor-pointer font-semibold text-white transition-colors"
                            onClick={handleTimKiem}
                        >
                            Tìm
                        </td>
                    </tr>
                </thead>
                
                <tbody>
                    {danhSachHienThi.map((phong, index) => (
                        <tr 
                            key={index} 
                            className={`border-b border-[#333333] cursor-pointer transition-colors ${phongDangChon?.MaPhong === phong.MaPhong ? 'bg-[#2A2A2A]' : 'bg-[#1A1A1A] hover:bg-[#1f1f1f]'}`}
                            onClick={() => chonPhong(phong)}
                        >
                            <td className="p-4 border border-[#333333]">
                                <input 
                                    type="radio" 
                                    name="chonPhong"
                                    checked={phongDangChon?.MaPhong === phong.MaPhong}
                                    onChange={() => chonPhong(phong)}
                                    className="w-4 h-4 cursor-pointer accent-[#2A754B]"
                                />
                            </td>
                            <td className="p-4 border border-[#333333] text-gray-200">{phong.MaPhong}</td>
                            <td className="p-4 border border-[#333333]">{phong.SoNguoiThueToiDa}</td>
                            <td className="p-4 border border-[#333333] text-gray-200">
                                {formatGiaTien(phong.GiaThuePhong)}
                            </td>
                            <td className="p-4 border border-[#333333]">{phong.TrangThai}</td>
                            <td className="p-4 border border-[#333333]">{phong.DieuKienChoThue}</td>
                        </tr>
                    ))}

                    {danhSachHienThi.length === 0 && (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500 italic bg-[#1A1A1A]">
                                Không tìm thấy phòng phù hợp.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;