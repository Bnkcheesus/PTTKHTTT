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
        <nav className="bg-green-700 text-white">
            <div className="flex items-center">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`px-6 py-3 font-medium transition ${location.pathname === item.path
                                ? 'bg-green-800 border-b-4 border-white'
                                : 'hover:bg-green-600'
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
