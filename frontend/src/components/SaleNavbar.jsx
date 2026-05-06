import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SaleNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { label: 'Đăng ký thuê', path: '/dang-ky-phong' },
        { label: 'Hẹn lịch', path: '/hen-lich' },
        { label: 'Xác nhận thuê', path: '/xac-nhan-thue' },
        { label: 'Thanh toán cọc', path: '/thanh-toan-coc' },
        { label: 'Lập hợp đồng', path: '/lap-hop-dong' },
        { label: 'Trả phòng', path: '/tra-phong' },
    ];

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            logout();
            navigate('/login');
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
};

export default SaleNavbar;