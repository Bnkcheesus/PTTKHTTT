import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRedirect() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Đang tải...</div>;
    if (!user) return <Navigate to="/login" replace />;

    // Điều hướng dựa trên loại nhân viên
    switch (user.employeeType) {
        case 'Manager':
            return <Navigate to="/manager/deposits" replace />;
        case 'Sales':
            return <Navigate to="/dang-ky-phong" replace />;
        case 'Accounting':
            return <Navigate to="/accounting/reconciliation" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
}
