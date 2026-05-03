import React, { useState, useEffect } from 'react';

const RegistrationModal = ({ moHopThoai, phongDangChon, dongHopThoai, xacNhanDangKy }) => {
    const [buocHienTai, setBuocHienTai] = useState(0);
    const [khachDaiDien, setKhachDaiDien] = useState({
        HoTen: '', CCCD: '', GioiTinh: 'Nam', SDT: '', Email: '', NhuCau: 'Nguyên phòng', SoNguoiChung: 0
    });
    const [danhSachKhachPhu, setDanhSachKhachPhu] = useState([]);

    useEffect(() => {
        if (moHopThoai) {
            setBuocHienTai(0);
            setKhachDaiDien({ HoTen: '', CCCD: '', GioiTinh: 'Nam', SDT: '', Email: '', NhuCau: 'Nguyên phòng', SoNguoiChung: 0 });
            setDanhSachKhachPhu([]);
        }
    }, [moHopThoai]);

    if (!moHopThoai) return null;

    const soLuongKhachPhu = parseInt(khachDaiDien.SoNguoiChung) || 0;
    const laBuocCuoiCung = buocHienTai === soLuongKhachPhu;

    const XuLyTiepTucHoacXacNhan = () => {
        const duLieuHienTai = buocHienTai === 0 ? khachDaiDien : danhSachKhachPhu[buocHienTai - 1];
        if (!duLieuHienTai.HoTen || !duLieuHienTai.CCCD || !duLieuHienTai.SDT) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
            return;
        }

        if (!laBuocCuoiCung) {
            if (buocHienTai === 0 && danhSachKhachPhu.length !== soLuongKhachPhu) {
                setDanhSachKhachPhu(Array(soLuongKhachPhu).fill({ HoTen: '', CCCD: '', GioiTinh: 'Nam', SDT: '', Email: '' }));
            }
            setBuocHienTai(buocHienTai + 1);
        } else {
            xacNhanDangKy(khachDaiDien, danhSachKhachPhu);
        }
    };

    const XuLyQuayLai = () => {
        if (buocHienTai > 0) setBuocHienTai(buocHienTai - 1);
    };

    const CapNhatKhachPhu = (truongDuLieu, giaTri) => {
        const danhSachMoi = [...danhSachKhachPhu];
        danhSachMoi[buocHienTai - 1] = { ...danhSachMoi[buocHienTai - 1], [truongDuLieu]: giaTri };
        setDanhSachKhachPhu(danhSachMoi);
    };

    const khachHienTai = buocHienTai === 0 ? khachDaiDien : danhSachKhachPhu[buocHienTai - 1] || {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-[600px] shadow-2xl relative">
                <div className="bg-[#333333] text-white text-center py-3 font-semibold text-lg">
                    {buocHienTai === 0 ? "Điền thông tin người đăng ký" : "Điền thông tin người thuê chung"}
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Họ và tên*</label>
                            <input type="text" className="w-full border border-gray-400 p-2 rounded outline-none focus:border-green-700" 
                                value={khachHienTai.HoTen} 
                                onChange={(e) => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, HoTen: e.target.value}) : CapNhatKhachPhu('HoTen', e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">CCCD*</label>
                            <input type="text" className="w-full border border-gray-400 p-2 rounded outline-none focus:border-green-700" 
                                value={khachHienTai.CCCD} 
                                onChange={(e) => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, CCCD: e.target.value}) : CapNhatKhachPhu('CCCD', e.target.value)} 
                            />
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block font-semibold mb-1 text-sm">Giới tính*</label>
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="gender" className="accent-green-700" checked={khachHienTai.GioiTinh === 'Nam'} onChange={() => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, GioiTinh: 'Nam'}) : CapNhatKhachPhu('GioiTinh', 'Nam')} /> Nam
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="gender" className="accent-green-700" checked={khachHienTai.GioiTinh === 'Nữ'} onChange={() => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, GioiTinh: 'Nữ'}) : CapNhatKhachPhu('GioiTinh', 'Nữ')} /> Nữ
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="gender" className="accent-green-700" checked={khachHienTai.GioiTinh === 'Khác'} onChange={() => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, GioiTinh: 'Khác'}) : CapNhatKhachPhu('GioiTinh', 'Khác')} /> Khác:
                                </label>
                                <input type="text" className="border border-gray-400 p-1 rounded outline-none w-24" disabled={khachHienTai.GioiTinh !== 'Khác'} />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1 text-sm">Số điện thoại*</label>
                            <input type="text" className="w-full border border-gray-400 p-2 rounded outline-none focus:border-green-700" 
                                value={khachHienTai.SDT} 
                                onChange={(e) => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, SDT: e.target.value}) : CapNhatKhachPhu('SDT', e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">Email</label>
                            <input type="email" className="w-full border border-gray-400 p-2 rounded outline-none focus:border-green-700" 
                                value={khachHienTai.Email} 
                                onChange={(e) => buocHienTai === 0 ? setKhachDaiDien({...khachDaiDien, Email: e.target.value}) : CapNhatKhachPhu('Email', e.target.value)} 
                            />
                        </div>
                    </div>

                    {buocHienTai === 0 && (
                        <div className="mt-4">
                            <label className="block font-semibold mb-1 text-sm">Nhu cầu thuê*</label>
                            <div className="flex gap-4 items-center mb-4">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="nhuCau" className="accent-green-700" checked={khachDaiDien.NhuCau === 'Ở ghép'} onChange={() => setKhachDaiDien({...khachDaiDien, NhuCau: 'Ở ghép'})} /> Ở ghép
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="nhuCau" className="accent-green-700" checked={khachDaiDien.NhuCau === 'Nguyên phòng'} onChange={() => setKhachDaiDien({...khachDaiDien, NhuCau: 'Nguyên phòng'})} /> Nguyên phòng
                                </label>
                            </div>
                            
                            <label className="block font-semibold mb-1 text-sm">Số lượng người thuê chung khác*</label>
                            <input type="number" min="0" className="border border-gray-400 p-2 rounded w-24 outline-none focus:border-green-700" 
                                value={khachDaiDien.SoNguoiChung}
                                onChange={(e) => setKhachDaiDien({...khachDaiDien, SoNguoiChung: e.target.value})} 
                            />
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={buocHienTai === 0 ? dongHopThoai : XuLyQuayLai} className="bg-gray-300 text-black px-6 py-2 rounded font-semibold hover:bg-gray-400 transition-colors">
                            {buocHienTai === 0 ? "Huỷ" : "Quay lại"}
                        </button>
                        <button onClick={XuLyTiepTucHoacXacNhan} className="bg-[#2A754B] text-white px-6 py-2 rounded font-semibold hover:bg-green-800 transition-colors shadow-md">
                            {laBuocCuoiCung ? "Xác nhận" : "Tiếp"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;