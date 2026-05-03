import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomTable from '../../components/RoomTable';
import RegistrationModal from '../../components/RegistrationModal';
import SaleNavbar from '../../components/SaleNavbar';

const RoomRegistration = () => {
    const [danhSachPhong, setDanhSachPhong] = useState([]);
    const [phongDangChon, setPhongDangChon] = useState(null);
    const [moHopThoai, setMoHopThoai] = useState(false);
    const [thongBao, setThongBao] = useState({ hienThi: false, noiDung: '', loai: '' });

    useEffect(() => {
        if (thongBao.hienThi) {
            const timer = setTimeout(() => setThongBao({ hienThi: false, noiDung: '', loai: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [thongBao]);

    useEffect(() => {
        LayDanhSachPhong();
    }, []);

    const LayDanhSachPhong = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/rooms');
            setDanhSachPhong(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách phòng:", error);
        }
    };

    const KiemTraVaMoDangKy = async () => {
        if (!phongDangChon) {
            setThongBao({ hienThi: true, noiDung: "Vui lòng chọn một phòng trước khi đăng ký!", loai: "error" });
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/rooms/${phongDangChon.MaPhong}`);
            if (res.data.TrangThai !== 'Trống') {
                setThongBao({ hienThi: true, noiDung: "Phòng đã thuê! Vui lòng chọn phòng khác", loai: "error" });
                return;
            }
            setMoHopThoai(true);
        } catch (error) {
            console.error(error);
            setThongBao({ hienThi: true, noiDung: "Lỗi kết nối máy chủ", loai: "error" });
        }
    };

    const GoiApiDangKy = async (khachDaiDien, danhSachKhachPhu) => {
        const soLuongKhachPhu = parseInt(khachDaiDien.SoNguoiChung) || 0;
        
        try {
            if (soLuongKhachPhu === 0) {
                await axios.post('http://localhost:5000/api/customers/register-flow', {
                    customerInfo: khachDaiDien,
                    requestInfo: {
                        SoNguoiDuKien: 1, 
                        KhoangGia: phongDangChon.GiaThuePhong, 
                        ThoiGianDuKien: '12 Tháng',
                        GhiChu: '', 
                        HinhThucThue: khachDaiDien.NhuCau,
                        MaKV: phongDangChon.MaKV, 
                        MaLoai: phongDangChon.MaLoai, 
                        MaPhong: phongDangChon.MaPhong
                    }
                });
            } else {
                await axios.post('http://localhost:5000/api/customers/register-group-flow', {
                    daiDienInfo: khachDaiDien,
                    khachPhuList: danhSachKhachPhu,
                    requestInfo: {
                        SoNguoiDuKien: soLuongKhachPhu + 1, 
                        KhoangGia: phongDangChon.GiaThuePhong, 
                        ThoiGianDuKien: '12 Tháng',
                        GhiChu: '', 
                        HinhThucThue: khachDaiDien.NhuCau,
                        MaKV: phongDangChon.MaKV, 
                        MaLoai: phongDangChon.MaLoai, 
                        MaPhong: phongDangChon.MaPhong
                    }
                });
            }

            setMoHopThoai(false);
            setThongBao({ hienThi: true, noiDung: "Đăng ký phòng thành công!", loai: "success" });
            setPhongDangChon(null);
            LayDanhSachPhong(); 
            
        } catch (error) {
            console.error(error);
            setThongBao({ hienThi: true, noiDung: "Đăng ký thất bại. Vui lòng thử lại!", loai: "error" });
        }
    };

    return (
        // Thẻ div bọc ngoài cùng chiếm toàn bộ màn hình
        <div className="bg-[#1A1A1A] min-h-screen pb-10"> 
            
            {/* Chèn thanh điều hướng vào đây (nằm sát trên cùng) */}
            <SaleNavbar />

            {/* Thẻ div chứa nội dung chính */}
            <div className="p-8 max-w-6xl mx-auto relative mt-8 bg-white rounded-md shadow-lg">
                
                {/* Pop-up thông báo (Dùng fixed và z-[9999] để luôn nằm giữa màn hình nổi lên trên cùng) */}
                {thongBao.hienThi && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 z-[9999] text-white font-bold shadow-2xl text-lg text-center bg-[#2A754B] rounded">
                        {thongBao.noiDung.split('!').map((text, i) => (
                            <div key={i}>{text}{i === 0 ? '!' : ''}</div>
                        ))}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-center text-gray-800">Danh sách các phòng khách có thể thuê</h2>
                <p className="text-center text-gray-500 italic text-sm mb-4">(Chọn một phòng để thuê cho khách)</p>

                <RoomTable 
                    danhSachPhong={danhSachPhong} 
                    phongDangChon={phongDangChon} 
                    chonPhong={(phong) => setPhongDangChon(phong)} 
                />

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={KiemTraVaMoDangKy} 
                        className="bg-[#2A754B] text-white px-8 py-2 font-bold rounded hover:bg-green-800 transition-colors shadow-md"
                    >
                        Đăng ký
                    </button>
                </div>

                <RegistrationModal 
                    moHopThoai={moHopThoai} 
                    phongDangChon={phongDangChon}
                    dongHopThoai={() => setMoHopThoai(false)}
                    xacNhanDangKy={GoiApiDangKy}
                />
            </div>
        </div>
    );
};

export default RoomRegistration;