import React from 'react';

const PendingCustomerTable = ({ danhSachKhach, khachDangChon, chonKhach }) => {
    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse border border-gray-300 text-center text-sm">
                <thead className="bg-[#333333] text-white">
                    <tr>
                        <th className="p-3 border border-gray-400 font-semibold w-16">Chọn</th>
                        <th className="p-3 border border-gray-400 font-semibold">Mã khách hàng</th>
                        <th className="p-3 border border-gray-400 font-semibold">Họ tên</th>
                        <th className="p-3 border border-gray-400 font-semibold">Giới tính</th>
                        <th className="p-3 border border-gray-400 font-semibold">SĐT</th>
                        <th className="p-3 border border-gray-400 font-semibold">Email</th>
                        <th className="p-3 border border-gray-400 font-semibold">CCCD</th>
                        <th className="p-3 border border-gray-400 font-semibold">Phòng đăng ký</th>
                        <th className="p-3 border border-gray-400 font-semibold">Nhu cầu thuê</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white">
                        <td className="p-2 border border-gray-300"></td>
                        <td className="p-2 border border-gray-300 col-span-7">
                            <input type="text" placeholder="Nhập mã khách hàng" className="w-full p-1 outline-none text-gray-400 italic" />
                        </td>
                        <td className="p-2 border border-gray-300 bg-[#333333] text-white cursor-pointer hover:bg-gray-700 font-semibold">Tìm</td>
                    </tr>

                    {danhSachKhach.map((khach, index) => (
                        <tr 
                            key={index} 
                            className={`hover:bg-gray-50 cursor-pointer ${khachDangChon?.MaKH === khach.MaKH ? 'bg-gray-100' : 'bg-white'}`}
                            onClick={() => chonKhach(khach)}
                        >
                            <td className="p-3 border border-gray-300">
                                <input 
                                    type="radio" 
                                    name="customerSelect" 
                                    className="w-4 h-4 accent-green-700 cursor-pointer"
                                    checked={khachDangChon?.MaKH === khach.MaKH}
                                    onChange={() => chonKhach(khach)} 
                                />
                            </td>
                            <td className="p-3 border border-gray-300">{khach.MaKH}</td>
                            <td className="p-3 border border-gray-300">{khach.HoTen}</td>
                            <td className="p-3 border border-gray-300">{khach.GioiTinh}</td>
                            <td className="p-3 border border-gray-300">{khach.SDT}</td>
                            <td className="p-3 border border-gray-300 truncate max-w-[100px]" title={khach.Email}>{khach.Email}</td>
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