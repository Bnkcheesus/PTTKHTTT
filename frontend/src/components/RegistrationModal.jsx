import React, { useState, useEffect } from 'react';

const RegistrationModal = ({ moHopThoai, phongDangChon, dongHopThoai, xacNhanDangKy }) => {
    // --- STEP QUẢN LÝ ---
    // 0: Form người đại diện
    // 1 -> N: Form khách đi cùng thứ 1 đến N
    const [buocHienTai, setBuocHienTai] = useState(0);

    // --- STATE THÔNG TIN NGƯỜI ĐẠI DIỆN ---
    const [hoTen, setHoTen] = useState('');
    const [cccd, setCccd] = useState('');
    const [gioiTinh, setGioiTinh] = useState('Nam');
    const [gioiTinhKhac, setGioiTinhKhac] = useState('');
    const [sdt, setSdt] = useState('');
    const [email, setEmail] = useState('');
    const [nhuCau, setNhuCau] = useState('Nguyên phòng');
    const [soNguoiChung, setSoNguoiChung] = useState(0);

    // --- STATE THÔNG TIN KHÁCH ĐI CÙNG ---
    const [danhSachKhachPhu, setDanhSachKhachPhu] = useState([]);

    // Reset modal khi mở lại
    useEffect(() => {
        if (moHopThoai) setBuocHienTai(0);
    }, [moHopThoai]);

    // Khởi tạo/Cập nhật mảng khách phụ khi đổi số lượng
    useEffect(() => {
        const soLuong = parseInt(soNguoiChung) || 0;
        setDanhSachKhachPhu(prev => {
            const moi = [...prev];
            if (soLuong > moi.length) {
                for (let i = moi.length; i < soLuong; i++) {
                    moi.push({ HoTen: '', CCCD: '', GioiTinh: 'Nam', GioiTinhKhac: '', SDT: '', Email: '' });
                }
            } else {
                return moi.slice(0, soLuong);
            }
            return moi;
        });
    }, [soNguoiChung]);

    if (!moHopThoai) return null;

    // Hàm cập nhật field cho khách phụ hiện tại
    const handleSuaKhachPhu = (field, value) => {
        const moi = [...danhSachKhachPhu];
        moi[buocHienTai - 1][field] = value;
        setDanhSachKhachPhu(moi);
    };

    // Hàm xử lý nút Tới/Tiếp/Xác nhận
    const handleTiepTuc = () => {
        if (buocHienTai === 0) {
            if (!hoTen || !cccd || !sdt) {
                alert("Vui lòng nhập đầy đủ Họ tên, CCCD và Số điện thoại!");
                return;
            }
            if (parseInt(soNguoiChung) > 0) {
                setBuocHienTai(1);
            } else {
                hoanTatDangKy();
            }
        } else {
            const khachHienTai = danhSachKhachPhu[buocHienTai - 1];
            if (!khachHienTai.HoTen || !khachHienTai.CCCD || !khachHienTai.SDT) {
                alert(`Vui lòng nhập đủ Họ tên, CCCD và SĐT cho người thuê chung thứ ${buocHienTai}`);
                return;
            }

            if (buocHienTai < parseInt(soNguoiChung)) {
                setBuocHienTai(prev => prev + 1);
            } else {
                hoanTatDangKy();
            }
        }
    };

    const handleQuayLai = () => {
        setBuocHienTai(prev => prev - 1);
    };

    const hoanTatDangKy = () => {
        const payload = {
            khachDaiDien: {
                HoTen: hoTen,
                CCCD: cccd,
                GioiTinh: gioiTinh === 'Khác' ? gioiTinhKhac : gioiTinh,
                SDT: sdt,
                Email: email,
            },
            NhuCau: nhuCau,
            SoNguoiChung: soNguoiChung,
            HinhThucThue: nhuCau,
            SoNguoiDuKien: nhuCau === 'Nguyên phòng' ? 1 + Number(soNguoiChung) : 1,
            MaPhong: phongDangChon?.MaPhong,
            KhoangGia: phongDangChon?.GiaThuePhong
        };

        const dsKhachPhuSuaDeGui = danhSachKhachPhu.map(k => ({
            ...k,
            GioiTinh: k.GioiTinh === 'Khác' ? k.GioiTinhKhac : k.GioiTinh
        }));

        xacNhanDangKy(payload, dsKhachPhuSuaDeGui);
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-[100]">
            <div className="bg-white w-[600px] rounded shadow-2xl overflow-hidden flex flex-col">

                {/* --- HEADER --- */}
                <div className="bg-[#333333] text-white text-center py-3 font-bold text-lg flex-shrink-0">
                    {buocHienTai === 0 ? "Điền thông tin người đăng ký" : `Điền thông tin người thuê chung (${buocHienTai}/${soNguoiChung})`}
                </div>

                {/* --- CONTENT (Scrollable) --- */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {buocHienTai === 0 ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
                                        <input type="radio" checked={gioiTinh === 'Nam'} onChange={() => setGioiTinh('Nam')} className="w-4 h-4 accent-[#2A754B]" /> Nam
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={gioiTinh === 'Nữ'} onChange={() => setGioiTinh('Nữ')} className="w-4 h-4 accent-[#2A754B]" /> Nữ
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={gioiTinh === 'Khác'} onChange={() => setGioiTinh('Khác')} className="w-4 h-4 accent-[#2A754B]" /> Khác:
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
                                        <input type="radio" checked={nhuCau === 'Ở ghép'} onChange={() => setNhuCau('Ở ghép')} className="w-4 h-4 accent-[#2A754B]" /> Ở ghép
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={nhuCau === 'Nguyên phòng'} onChange={() => setNhuCau('Nguyên phòng')} className="w-4 h-4 accent-[#2A754B]" /> Nguyên phòng
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-800 mb-1">Số lượng người thuê chung khác*</label>
                                <input type="number" value={soNguoiChung} onChange={(e) => setSoNguoiChung(e.target.value)} min="0" className="border border-gray-400 p-2 rounded w-20 outline-none focus:border-[#2A754B]" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-1">Họ và tên*</label>
                                <input
                                    type="text"
                                    value={danhSachKhachPhu[buocHienTai - 1]?.HoTen || ''}
                                    onChange={(e) => handleSuaKhachPhu('HoTen', e.target.value)}
                                    className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-1">CCCD*</label>
                                <input
                                    type="text"
                                    value={danhSachKhachPhu[buocHienTai - 1]?.CCCD || ''}
                                    onChange={(e) => handleSuaKhachPhu('CCCD', e.target.value)}
                                    className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Giới tính*</label>
                                <div className="flex items-center gap-4 text-sm">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={danhSachKhachPhu[buocHienTai - 1]?.GioiTinh === 'Nam'} onChange={() => handleSuaKhachPhu('GioiTinh', 'Nam')} className="w-4 h-4 accent-[#2A754B]" /> Nam
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={danhSachKhachPhu[buocHienTai - 1]?.GioiTinh === 'Nữ'} onChange={() => handleSuaKhachPhu('GioiTinh', 'Nữ')} className="w-4 h-4 accent-[#2A754B]" /> Nữ
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={danhSachKhachPhu[buocHienTai - 1]?.GioiTinh === 'Khác'} onChange={() => handleSuaKhachPhu('GioiTinh', 'Khác')} className="w-4 h-4 accent-[#2A754B]" /> Khác:
                                        <input
                                            type="text"
                                            value={danhSachKhachPhu[buocHienTai - 1]?.GioiTinhKhac || ''}
                                            onChange={(e) => { handleSuaKhachPhu('GioiTinh', 'Khác'); handleSuaKhachPhu('GioiTinhKhac', e.target.value); }}
                                            disabled={danhSachKhachPhu[buocHienTai - 1]?.GioiTinh !== 'Khác'}
                                            className="border border-gray-400 p-1 rounded w-24 outline-none focus:border-[#2A754B]"
                                        />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-1">Số điện thoại*</label>
                                <input
                                    type="text"
                                    value={danhSachKhachPhu[buocHienTai - 1]?.SDT || ''}
                                    onChange={(e) => handleSuaKhachPhu('SDT', e.target.value)}
                                    className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={danhSachKhachPhu[buocHienTai - 1]?.Email || ''}
                                    onChange={(e) => handleSuaKhachPhu('Email', e.target.value)}
                                    className="w-full border border-gray-400 p-2 rounded outline-none focus:border-[#2A754B]"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- FOOTER (Fixed at bottom) --- */}
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200 flex-shrink-0">
                    {buocHienTai === 0 ? (
                        <>
                            <button onClick={dongHopThoai} className="bg-[#D1D5DB] text-gray-800 px-6 py-2 font-bold rounded hover:bg-gray-300 transition-colors">
                                Huỷ
                            </button>
                            <button onClick={handleTiepTuc} className="bg-[#2A754B] text-white px-6 py-2 font-bold rounded hover:bg-green-800 transition-colors">
                                {parseInt(soNguoiChung) > 0 ? "Tiếp tục" : "Xác nhận"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleQuayLai} className="bg-[#D1D5DB] text-gray-800 px-6 py-2 font-bold rounded hover:bg-gray-300 transition-colors">
                                Quay lại
                            </button>
                            <button
                                onClick={handleTiepTuc}
                                className={`${buocHienTai === parseInt(soNguoiChung) ? 'bg-[#2A754B] text-white' : 'bg-[#D1D5DB] text-gray-800'} px-6 py-2 font-bold rounded hover:opacity-80 transition-colors`}
                            >
                                {buocHienTai === parseInt(soNguoiChung) ? "Xác nhận" : "Tiếp theo"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;