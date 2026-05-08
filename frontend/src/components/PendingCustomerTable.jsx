import React, { useState, useEffect } from 'react';

const PendingCustomerTable = ({ danhSachKhach, khachDangChon, chonKhach }) => {
    const [timMaKH, setTimMaKH] = useState('');
    const [danhSachHienThi, setDanhSachHienThi] = useState([]);

    useEffect(() => {
        setDanhSachHienThi(danhSachKhach);
    }, [danhSachKhach]);

    const handleTimKiem = () => {
        const ketQua = danhSachKhach.filter(khach => {
            const matchMaKH = khach.MaKH?.toLowerCase().includes(timMaKH.toLowerCase());
            return timMaKH === '' || matchMaKH;
        });
        setDanhSachHienThi(ketQua);
    };

    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full text-center border-collapse border border-gray-400 text-sm">
                <thead>
                    {/* HÀNG TIÊU ĐỀ: Nền xám đậm, chữ trắng */}
                    <tr className="bg-[#333333] text-white">
                        <th className="p-3 border border-gray-400 font-semibold w-16">Mã khách hàng</th>
                        <th className="p-3 border border-gray-400 font-semibold">Họ tên</th>
                        <th className="p-3 border border-gray-400 font-semibold">Giới tính</th>
                        <th className="p-3 border border-gray-400 font-semibold">SĐT</th>
                        <th className="p-3 border border-gray-400 font-semibold">Email</th>
                        <th className="p-3 border border-gray-400 font-semibold">CCCD</th>
                        <th className="p-3 border border-gray-400 font-semibold">Phòng đăng ký</th>
                        <th className="p-3 border border-gray-400 font-semibold">Nhu cầu thuê</th>
                    </tr>

                    {/* HÀNG TÌM KIẾM: Nền trắng, ô input kéo dài (colSpan) giống hệt ảnh */}
                    <tr className="bg-white border-b border-gray-400">
                        <td className="p-2 border border-gray-300 col-span-7" colSpan="7">
                            <input 
                                type="text" 
                                placeholder="Nhập mã khách hàng" 
                                value={timMaKH}
                                onChange={(e) => setTimMaKH(e.target.value)}
                                className="w-full px-2 bg-transparent text-left text-gray-600 italic outline-none placeholder-gray-300"
                            />
                        </td>
                        <td 
                            className="p-2 border border-gray-400 bg-[#333333] text-white hover:bg-gray-700 cursor-pointer font-semibold transition-colors"
                            onClick={handleTimKiem}
                        >
                            Tìm
                        </td>
                    </tr>
                </thead>
                
                <tbody className="text-gray-800">
                    {danhSachHienThi.map((khach, index) => (
                        <tr 
                            key={index} 
                            className={`border-b border-gray-300 cursor-pointer transition-colors ${khachDangChon?.MaKH === khach.MaKH ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                            onClick={() => chonKhach(khach)}
                        >
                            <td className="p-3 border border-gray-300 flex items-center justify-center gap-2">
                                <input 
                                    type="radio" 
                                    name="customerSelect" 
                                    checked={khachDangChon?.MaKH === khach.MaKH}
                                    onChange={() => chonKhach(khach)} 
                                    className="w-4 h-4 cursor-pointer accent-[#2A754B]"
                                />
                                {khach.MaKH}
                            </td>
                            <td className="p-3 border border-gray-300">{khach.HoTen}</td>
                            <td className="p-3 border border-gray-300">{khach.GioiTinh}</td>
                            <td className="p-3 border border-gray-300">{khach.SDT}</td>
                            <td className="p-3 border border-gray-300 truncate max-w-[120px]" title={khach.Email}>{khach.Email}</td>
                            <td className="p-3 border border-gray-300">{khach.CCCD}</td>
                            <td className="p-3 border border-gray-300">{khach.MaPhong}</td>
                            <td className="p-3 border border-gray-300">{khach.HinhThucThue}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PendingCustomerTable;