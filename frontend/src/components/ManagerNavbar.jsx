import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function ManagerNavbar() {
    const location = useLocation();

    const navItems = [
        { label: 'Kiểm tra khách', path: '/manager/deposits' },
        { label: 'Biên bản', path: '/manager/bienban' },
        { label: 'Kiểm tra phòng', path: '/manager/rooms' },
        { label: 'Phiếu đối soát', path: '/manager/reconciliation' },
        { label: 'Quản lý', path: '/manager/management' },
        { label: 'Đăng xuất', path: '/logout' },
    ];

    return (
        <nav style={{ backgroundColor: '#237850' }} className="text-white shadow-md">
            <div className="flex items-center">
                {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`px-6 py-4 font-medium transition-colors text-sm ${isActive
                                ? 'bg-[#1a5a3c] shadow-inner' // Darker green for active
                                : 'hover:bg-[#2d8a5d]'
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}