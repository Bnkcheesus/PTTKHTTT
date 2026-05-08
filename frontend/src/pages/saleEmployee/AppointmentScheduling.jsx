import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PendingCustomerTable from '../../components/PendingCustomerTable';
import AppointmentModal from '../../components/AppointmentModal';
import SaleNavbar from '../../components/SaleNavbar';

const AppointmentScheduling = () => {
    const [danhSachKhach, setDanhSachKhach] = useState([]);
    const [khachDangChon, setKhachDangChon] = useState(null);
    const [moHopThoai, setMoHopThoai] = useState(false);
    const [thongBao, setThongBao] = useState({ hienThi: false, noiDung: '', loai: '' });

    // Lấy Mã Nhân Viên đang đăng nhập (Giả lập lấy từ LocalStorage)
    // Thực tế bác hãy sửa lại cho đúng với logic đăng nhập của bác nhé
    const maNVHienTai = localStorage.getItem('MaNV') || 'NV001'; 

    useEffect(() => {
        if (thongBao.hienThi) {
            const timer = setTimeout(() => setThongBao({ hienThi: false, noiDung: '', loai: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [thongBao]);

    useEffect(() => {
        LayDanhSachKhachChuaHen();
    }, []);

    const LayDanhSachKhachChuaHen = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/appointments/pending');
            
            // THÊM DÒNG NÀY VÀO ĐỂ XEM BACKEND THỰC SỰ TRẢ VỀ CÁI GÌ
            console.log("Dữ liệu Backend trả về:", response.data); 
            
            setDanhSachKhach(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách chờ hẹn:", error);
        }
    };

    const KiemTraVaMoHenLich = async () => {
        if (!khachDangChon) {
            setThongBao({ hienThi: true, noiDung: "Vui lòng chọn một khách hàng!", loai: "error" });
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/appointments/request-details/${khachDangChon.MaKH}`);
            
            // ĐÃ SỬA CHỖ NÀY: Quét hết mọi trường hợp Backend có thể trả về
            // (Trả về object, trả về mảng, viết hoa, viết thường...)
            const maPhieu = res.data.MaPhieuYC || res.data.maPhieuYC || res.data[0]?.MaPhieuYC || res.data[0]?.maPhieuYC;
            
            if (!maPhieu) {
                alert("Lỗi: Không lấy được Mã Phiếu YC từ Backend!");
                return;
            }

            setKhachDangChon({ ...khachDangChon, MaPhieuYC: maPhieu });
            setMoHopThoai(true);
        } catch (error) {
            setThongBao({ hienThi: true, noiDung: "Khách hàng này chưa có Phiếu yêu cầu thuê phòng!", loai: "error" });
        }
    };

    // Sửa lại hàm này trong file AppointmentScheduling.jsx
    const GoiApiTaoLichHen = async (thoiGianGop) => {
        try {
            // Rào luôn trường hợp NULL để SQL không chửi
            const payload = {
                ThoiGian: thoiGianGop,
                LyDo: "Xem phòng",
                MaPhieuYC: khachDangChon.MaPhieuYC || "", // Thêm || "" để biến undefined thành rỗng
                MaNV: "NV001"
            };

            // In ra Console để bác xem tận mắt
            console.log("CHÚ Ý! Dữ liệu chuẩn bị gửi đi là:", payload);

            await axios.post('http://localhost:5000/api/appointments/schedule', payload); 

            setMoHopThoai(false);
            setThongBao({ hienThi: true, loai: 'success', noiDung: 'Tạo lịch hẹn mới thành công!' });
            setTimeout(() => {
                setThongBao({ hienThi: false, loai: '', noiDung: '' });
                window.location.reload(); 
            }, 2000);

        } catch (error) {
            let loiChiTiet = "Lỗi hệ thống hoặc Server chưa chạy.";
            if (error.response && error.response.data) {
                if (error.response.data.error) loiChiTiet = error.response.data.error;
                else if (error.response.data.message) loiChiTiet = error.response.data.message;
                else if (typeof error.response.data === 'string') loiChiTiet = error.response.data;
            } else if (error.message) {
                loiChiTiet = error.message;
            }

            setMoHopThoai(false);
            setThongBao({ hienThi: true, loai: 'error', noiDung: `Thất bại: ${loiChiTiet}` });
            setTimeout(() => setThongBao({ hienThi: false, loai: '', noiDung: '' }), 5000);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-10"> 
            
            <SaleNavbar />

            <div className="p-8 max-w-6xl mx-auto relative mt-4">
                
                {thongBao.hienThi && (
                    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 z-[9999] text-white font-bold shadow-2xl text-lg text-center rounded
                        ${thongBao.loai === 'success' ? 'bg-[#2A754B]' : 'bg-red-600'}`}>
                        {thongBao.noiDung}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-center text-[#333333]">Danh sách các khách có thể hẹn lịch</h2>
                <p className="text-center text-gray-500 italic text-sm mb-4">(Chọn một khách hàng để hẹn lịch)</p>

                <PendingCustomerTable 
                    danhSachKhach={danhSachKhach} 
                    khachDangChon={khachDangChon} 
                    chonKhach={(khach) => setKhachDangChon(khach)} 
                />

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={KiemTraVaMoHenLich} 
                        className="bg-[#2A754B] text-white px-8 py-2 font-bold rounded hover:bg-green-800 transition-colors shadow-md"
                    >
                        Thêm lịch hẹn mới
                    </button>
                </div>

                <AppointmentModal 
                    moHopThoai={moHopThoai} 
                    khachDangChon={khachDangChon}
                    dongHopThoai={() => setMoHopThoai(false)}
                    xacNhanHenLich={GoiApiTaoLichHen}
                />
            </div>
        </div>
    );
};

export default AppointmentScheduling;