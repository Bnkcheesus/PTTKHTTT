import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function ManagerNavbar() {
    const location = useLocation();

    // Tách Đăng xuất ra khỏi mảng để đẩy nó sang lề phải
    const navItems = [
        { label: 'Kiểm tra khách', path: '/manager/deposits' },
        { label: 'Biên bản', path: '/manager/bienban' },
        { label: 'Kiểm tra phòng', path: '/manager/rooms' },
        { label: 'Phiếu đối soát', path: '/manager/reconciliation' },
        { label: 'Quản lý', path: '/manager/management' },
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
            
            {/* Nút Đăng xuất nằm sát lề phải giống SaleNavbar */}
            <Link 
                to="/logout" 
                className="px-6 py-3 font-semibold hover:bg-green-800 transition-colors"
            >
                Đăng xuất
            </Link>
        </div>
    );
}