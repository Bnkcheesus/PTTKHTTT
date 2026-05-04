import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ManagerNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth(); // Lấy hàm logout từ context

    const navItems = [
        { label: 'Kiểm tra khách', path: '/manager/deposits' },
        { label: 'Biên bản', path: '/manager/bienban' },
        { label: 'Kiểm tra phòng', path: '/manager/rooms' },
        { label: 'Phiếu đối soát', path: '/manager/reconciliation' },
        { label: 'Quản lý', path: '/manager/management' },
    ];

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            logout();
            navigate('/login'); // Quay về trang đăng nhập
        }
    };

    return (
        <nav style={{ backgroundColor: '#237850' }} className="text-white shadow-md">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={index}
                                to={item.path}
                                className={`px-6 py-4 font-medium transition-colors text-sm ${isActive ? 'bg-[#1a5a3c] shadow-inner' : 'hover:bg-[#2d8a5d]'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Nút đăng xuất nằm riêng biệt bên phải */}
                <button
                    onClick={handleLogout}
                    className="px-6 py-4 font-medium text-sm hover:bg-red-700 transition-colors bg-opacity-20 bg-black"
                >
                    Đăng xuất
                </button>
            </div>
        </nav>
    );
}