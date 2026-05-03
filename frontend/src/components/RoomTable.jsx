import React from 'react';

const RoomTable = ({ danhSachPhong, phongDangChon, chonPhong }) => {
    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse border border-gray-300 text-center">
                <thead className="bg-[#333333] text-white">
                    <tr>
                        <th className="p-3 border border-gray-400 font-semibold w-16">Chọn</th>
                        <th className="p-3 border border-gray-400 font-semibold">Mã phòng</th>
                        <th className="p-3 border border-gray-400 font-semibold">Số người tối đa</th>
                        <th className="p-3 border border-gray-400 font-semibold">Giá thuê</th>
                        <th className="p-3 border border-gray-400 font-semibold">Tình trạng</th>
                        <th className="p-3 border border-gray-400 font-semibold">Điều kiện thuê</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white">
                        <td className="p-2 border border-gray-300"></td>
                        <td className="p-2 border border-gray-300"><input type="text" placeholder="Nhập mã phòng" className="w-full text-sm p-1 outline-none text-gray-400 italic" /></td>
                        <td className="p-2 border border-gray-300"><input type="text" placeholder="Nhập số người tối đa" className="w-full text-sm p-1 outline-none text-gray-400 italic" /></td>
                        <td className="p-2 border border-gray-300"><input type="text" placeholder="Nhập giá thuê" className="w-full text-sm p-1 outline-none text-gray-400 italic" /></td>
                        <td className="p-2 border border-gray-300"></td>
                        <td className="p-2 border border-gray-300 bg-[#333333] text-white cursor-pointer hover:bg-gray-700">Tìm</td>
                    </tr>

                    {danhSachPhong.map((phong) => (
                        <tr 
                            key={phong.MaPhong} 
                            className={`hover:bg-gray-50 cursor-pointer ${phongDangChon?.MaPhong === phong.MaPhong ? 'bg-gray-100' : 'bg-white'}`}
                            onClick={() => chonPhong(phong)}
                        >
                            <td className="p-3 border border-gray-300">
                                <input 
                                    type="radio" 
                                    name="roomSelect" 
                                    className="w-4 h-4 accent-green-700 cursor-pointer"
                                    checked={phongDangChon?.MaPhong === phong.MaPhong}
                                    onChange={() => chonPhong(phong)} 
                                />
                            </td>
                            <td className="p-3 border border-gray-300">{phong.MaPhong}</td>
                            <td className="p-3 border border-gray-300">{phong.SoNguoiThueToiDa}</td>
                            <td className="p-3 border border-gray-300">
                                {new Intl.NumberFormat('vi-VN').format(phong.GiaThuePhong)} VNĐ/tháng
                            </td>
                            <td className="p-3 border border-gray-300">{phong.TrangThai}</td>
                            <td className="p-3 border border-gray-300">{phong.DieuKienChoThue || 'Điều kiện thuê...'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;