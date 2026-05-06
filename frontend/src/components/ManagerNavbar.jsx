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
        <div className="bg-[#2A754B] flex justify-between items-center text-white px-4 shadow-md w-full">
            <div className="flex">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`px-6 py-3 font-semibold transition-colors ${location.pathname === item.path ? 'bg-[#333333]' : 'hover:bg-green-800'
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
            <button
                onClick={handleLogout}
                className="px-6 py-3 font-semibold hover:bg-red-700 transition-colors"
            >
                Đăng xuất
            </button>
        </div>
    );
}