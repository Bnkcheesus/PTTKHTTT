import React, { useState, useEffect } from 'react';

const PendingCustomerTable = ({ danhSachKhach, khachDangChon, chonKhach }) => {
    // Chỉ giữ lại một State duy nhất cho Mã KH
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
            <table className="w-full border-collapse border border-[#333333] text-center text-sm text-gray-300">
                <thead>
                    <tr className="bg-[#1A1A1A] text-white">
                        <th className="p-3 border border-[#333333] font-semibold w-16">Chọn</th>
                        <th className="p-3 border border-[#333333] font-semibold">Mã khách hàng</th>
                        <th className="p-3 border border-[#333333] font-semibold">Họ tên</th>
                        <th className="p-3 border border-[#333333] font-semibold">Giới tính</th>
                        <th className="p-3 border border-[#333333] font-semibold">SĐT</th>
                        <th className="p-3 border border-[#333333] font-semibold">Email</th>
                        <th className="p-3 border border-[#333333] font-semibold">CCCD</th>
                        <th className="p-3 border border-[#333333] font-semibold">Phòng đăng ký</th>
                        <th className="p-3 border border-[#333333] font-semibold">Nhu cầu thuê</th>
                    </tr>

                    {/* DÒNG TÌM KIẾM ĐÃ ĐƯỢC TỐI GIẢN */}
                    <tr className="bg-[#141414]">
                        <td className="p-2 border border-[#333333]"></td>
                        <td className="p-2 border border-[#333333]">
                            <input 
                                type="text" 
                                placeholder="Nhập mã KH" 
                                value={timMaKH}
                                onChange={(e) => setTimMaKH(e.target.value)}
                                className="w-full bg-transparent text-center text-gray-400 italic outline-none placeholder-gray-500"
                            />
                        </td>
                        {/* Các cột trống để giữ đúng form bảng */}
                        <td className="p-2 border border-[#333333]"></td>
                        <td className="p-2 border border-[#333333]"></td>
                        <td className="p-2 border border-[#333333]"></td>
                        <td className="p-2 border border-[#333333]"></td>
                        <td className="p-2 border border-[#333333]"></td>
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
                    {danhSachHienThi.map((khach, index) => (
                        <tr 
                            key={index} 
                            className={`border-b border-[#333333] cursor-pointer transition-colors ${khachDangChon?.MaKH === khach.MaKH ? 'bg-[#2A2A2A]' : 'bg-[#1A1A1A] hover:bg-[#1f1f1f]'}`}
                            onClick={() => chonKhach(khach)}
                        >
                            <td className="p-3 border border-[#333333]">
                                <input 
                                    type="radio" 
                                    name="customerSelect" 
                                    className="w-4 h-4 accent-[#2A754B] cursor-pointer"
                                    checked={khachDangChon?.MaKH === khach.MaKH}
                                    onChange={() => chonKhach(khach)} 
                                />
                            </td>
                            <td className="p-3 border border-[#333333] text-gray-200">{khach.MaKH}</td>
                            <td className="p-3 border border-[#333333] text-gray-200">{khach.HoTen}</td>
                            <td className="p-3 border border-[#333333]">{khach.GioiTinh}</td>
                            <td className="p-3 border border-[#333333]">{khach.SDT}</td>
                            <td className="p-3 border border-[#333333] truncate max-w-[120px]" title={khach.Email}>{khach.Email}</td>
                            <td className="p-3 border border-[#333333]">{khach.CCCD}</td>
                            <td className="p-3 border border-[#333333] text-gray-200 font-semibold">{khach.MaPhong}</td>
                            <td className="p-3 border border-[#333333]">{khach.HinhThucThue}</td>
                        </tr>
                    ))}

                    {danhSachHienThi.length === 0 && (
                        <tr>
                            <td colSpan="9" className="p-8 text-center text-gray-500 italic bg-[#1A1A1A]">
                                Không tìm thấy khách hàng nào phù hợp.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PendingCustomerTable;