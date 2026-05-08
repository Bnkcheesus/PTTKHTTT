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
            <table className="w-full text-center border-collapse border border-gray-400 text-sm">
                <thead>
                    {/* HÀNG TIÊU ĐỀ: Nền xám đậm, chữ trắng */}
                    <tr className="bg-[#333333] text-white">
                        {/* Cột Mã phòng rộng rãi (w-36) */}
                        <th className="p-3 border border-gray-400 font-semibold w-36">Mã phòng</th> 
                        
                        {/* Đã thêm w-32 ở đây để ép cột Số người tối đa nhỏ lại */}
                        <th className="p-3 border border-gray-400 font-semibold w-32">Số người tối đa</th>
                        
                        <th className="p-3 border border-gray-400 font-semibold">Giá thuê</th>
                        <th className="p-3 border border-gray-400 font-semibold">Tình trạng</th>
                        <th className="p-3 border border-gray-400 font-semibold">Điều kiện thuê</th>
                    </tr>
                    
                    {/* HÀNG TÌM KIẾM: Nền trắng, viền xám */}
                    <tr className="bg-white">
                        <td className="p-2 border border-gray-300">
                            <input 
                                type="text" 
                                placeholder="Nhập mã phòng" 
                                value={timMaPhong}
                                onChange={(e) => setTimMaPhong(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-600 italic outline-none placeholder-gray-300"
                            />
                        </td>
                        <td className="p-2 border border-gray-300">
                            <input 
                                type="text" 
                                placeholder="Nhập số người" 
                                value={timSoNguoi}
                                onChange={(e) => setTimSoNguoi(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-600 italic outline-none placeholder-gray-300"
                            />
                        </td>
                        <td className="p-2 border border-gray-300">
                            <input 
                                type="text" 
                                placeholder="Nhập giá thuê" 
                                value={timGiaThue}
                                onChange={(e) => setTimGiaThue(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-600 italic outline-none placeholder-gray-300"
                            />
                        </td>
                        <td className="p-2 border border-gray-300"></td>
                        <td 
                            className="p-2 border border-gray-400 bg-[#333333] text-white hover:bg-gray-700 cursor-pointer font-semibold transition-colors"
                            onClick={handleTimKiem}
                        >
                            Tìm
                        </td>
                    </tr>
                </thead>
                
                <tbody className="text-gray-800">
                    {danhSachHienThi.map((phong, index) => (
                        <tr 
                            key={index} 
                            className={`border-b border-gray-300 cursor-pointer transition-colors ${phongDangChon?.MaPhong === phong.MaPhong ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                            onClick={() => chonPhong(phong)}
                        >
                            <td className="p-3 border border-gray-300 flex justify-center items-center gap-3">
                                <input 
                                    type="radio" 
                                    name="chonPhong"
                                    checked={phongDangChon?.MaPhong === phong.MaPhong}
                                    onChange={() => chonPhong(phong)}
                                    className="w-4 h-4 cursor-pointer accent-[#2A754B]"
                                />
                                {phong.MaPhong}
                            </td>
                            <td className="p-3 border border-gray-300">{phong.SoNguoiThueToiDa}</td>
                            <td className="p-3 border border-gray-300">{formatGiaTien(phong.GiaThuePhong)}</td>
                            <td className="p-3 border border-gray-300">{phong.TrangThai}</td>
                            <td className="p-3 border border-gray-300">{phong.DieuKienChoThue}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;