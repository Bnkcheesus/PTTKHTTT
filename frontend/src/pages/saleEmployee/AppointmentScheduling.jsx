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
    // Ngoại lệ 1: Chưa chọn khách hàng
    if (!khachDangChon) {
        setThongBao({ hienThi: true, noiDung: "Vui lòng chọn một khách hàng để lên lịch hẹn!", loai: "error" });
        return;
    }

    try {
        // Kiểm tra xem khách này có Phiếu Yêu Cầu chưa (Ngoại lệ Sơ đồ Tuần Tự)
        const res = await axios.get(`http://localhost:5000/api/appointments/request-details/${khachDangChon.MaKH}`);
        
        // Cập nhật lại khachDangChon với thông tin Phiếu Yêu Cầu lấy được từ Backend
        setKhachDangChon({ ...khachDangChon, MaPhieuYC: res.data.MaPhieuYC });
        setMoHopThoai(true);
    } catch (error) {
        // Bắt lỗi 404 (Không tìm thấy PYC) từ Backend
        if (error.response && error.response.status === 404) {
             setThongBao({ hienThi: true, noiDung: "Khách hàng này chưa có Phiếu yêu cầu thuê phòng!", loai: "error" });
        } else {
             setThongBao({ hienThi: true, noiDung: "Lỗi kết nối khi kiểm tra Phiếu Yêu Cầu", loai: "error" });
        }
    }
};

    const GoiApiTaoLichHen = async (thoiGian, maPhieuYC) => {
        try {
            // Gọi API chốt lịch (Backend sẽ gọi SP KiemTraTrungLich trước khi lưu)
            await axios.post('http://localhost:5000/api/appointments/schedule', {
                ThoiGian: thoiGian,
                MaNV: maNVHienTai,
                LyDo: 'Hẹn xem phòng thực tế', // Mặc định
                MaPhieuYC: maPhieuYC
            });

            // Nếu Backend trả về 2xx -> Thành công (Ảnh 10)
            setMoHopThoai(false);
            setThongBao({ hienThi: true, noiDung: "Tạo lịch hẹn mới thành công!", loai: "success" });
            setKhachDangChon(null);
            LayDanhSachKhachChuaHen(); // Load lại bảng để khách hàng vừa hẹn biến mất
            
        } catch (error) {
            // Bắt lỗi Ngoại lệ: Trùng lịch (Backend ném ra HTTP 400)
            if (error.response && error.response.status === 400) {
                setThongBao({ hienThi: true, noiDung: error.response.data.message || "Bị trùng lịch với một khách hàng khác!", loai: "error" });
            } else {
                setThongBao({ hienThi: true, noiDung: "Đã xảy ra lỗi hệ thống khi tạo lịch hẹn.", loai: "error" });
            }
        }
    };

    return (
        // Thẻ div bọc ngoài cùng chiếm toàn bộ màn hình
        <div className="bg-[#1A1A1A] min-h-screen pb-10"> 
            
            {/* Chèn thanh điều hướng vào đây (nằm sát trên cùng) */}
            <SaleNavbar />

            {/* Thẻ div chứa nội dung chính của bác */}
            <div className="p-8 max-w-6xl mx-auto relative mt-8 bg-white rounded-md shadow-lg">
                
                {/* Pop-up thông báo (Dùng fixed để luôn ở giữa màn hình kể cả khi cuộn) */}
                {thongBao.hienThi && (
                    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 z-[9999] text-white font-bold shadow-2xl text-lg text-center rounded
                        ${thongBao.loai === 'success' ? 'bg-[#2A754B]' : 'bg-red-600'}`}>
                        {thongBao.noiDung}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-center text-gray-800">Danh sách các khách có thể hẹn lịch</h2>
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