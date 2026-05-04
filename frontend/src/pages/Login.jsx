import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // SỬA TẠI ĐÂY: Chỉ dùng một lần ../
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export default function Login() {
    const [username, setUsername] = useState(''); // Đây là MaNV nhập từ giao diện
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username.trim()) {
            setError('Vui lòng nhập mã nhân viên');
            setLoading(false);
            return;
        }

        try {
            // Gửi MaNV lên server qua body { username: 'NVxxx' }
            const res = await axios.post(`${API_URL}/login`, { username });
            const userData = res.data.data;

            // Lưu vào Context (MaNV, TenNV, employeeType)
            login(userData);

            // ĐIỀU HƯỚNG CHÍNH XÁC THEO APP.JSX
            if (userData.employeeType === 'Manager') {
                navigate('/manager/deposits');
            } else if (userData.employeeType === 'Sales') {
                navigate('/dang-ky-phong');
            } else if (userData.employeeType === 'Accounting') {
                navigate('/manager/reconciliation');
            } else {
                setError('Tài khoản không có quyền truy cập hệ thống này.');
            }
        } catch (err) {
            // Lấy message lỗi từ backend trả về (ví dụ: "Mã nhân viên không tồn tại")
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#d9ead3' }}>
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold" style={{ color: '#3c3836' }}>
                            QUẢN LÝ KÝ TÚC XÁ
                        </h1>
                        <p className="text-gray-600 text-sm mt-2 font-medium">Hệ thống lập biên bản & đối soát</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2" style={{ color: '#3c3836' }}>
                                Mã nhân viên
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập mã nhân viên của bạn"
                                className="w-full px-4 py-3 border border-gray-400 rounded outline-none focus:border-green-600 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: '#237850' }}
                            className="w-full text-white font-bold py-3 rounded hover:opacity-90 disabled:opacity-50 transition shadow-md"
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
                        <p>© 2026 Hệ thống quản lý nội bộ</p>
                    </div>
                </div>
            </div>
        </div>
    );
}