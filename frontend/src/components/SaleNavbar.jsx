import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SaleNavbar = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Đăng ký thuê', path: '/dang-ky-phong' },
        { label: 'Hẹn lịch', path: '/hen-lich' },
        { label: 'Xác nhận thuê', path: '/xac-nhan-thue' },
        { label: 'Thanh toán cọc', path: '/thanh-toan-coc' },
        { label: 'Hợp đồng', path: '/hop-dong' },
        { label: 'Trả phòng', path: '/tra-phong' },
    ];

    return (
        <div className="bg-[#2A754B] flex justify-between items-center text-white px-4 shadow-md w-full">
            <div className="flex">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`px-6 py-3 font-semibold transition-colors ${
                            location.pathname === item.path ? 'bg-[#333333]' : 'hover:bg-green-800'
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
            <Link to="/dang-xuat" className="px-6 py-3 font-semibold hover:bg-green-800 transition-colors">
                Đăng xuất
            </Link>
        </div>
    );
};

export default SaleNavbar;