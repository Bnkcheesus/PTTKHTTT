import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages cho Manager
import DepositsManagement from './pages/manager/DepositsManagement';
import BienBan from './pages/manager/BienBan';
import RoomChecking from './pages/manager/RoomChecking';
import Reconciliation from './pages/manager/Reconciliation';
import Management from './pages/manager/Management';
import AccountingPhatSinh from './pages/accounting/AccountingPhatSinh';
import AccountingHoanCoc from './pages/accounting/AccountingHoanCoc';

// Import Pages cho Sale Employee
import RoomRegistration from './pages/saleEmployee/RoomRegistration';
import AppointmentScheduling from './pages/saleEmployee/AppointmentScheduling';
import LapHopDong from './pages/saleEmployee/LapHopDong';
import TraPhong from './pages/saleEmployee/TraPhong';
import XacNhanThue from './pages/saleEmployee/XacNhanThue';
import ThanhToanCoc from './pages/saleEmployee/ThanhToanCoc';


// Import Login
import Login from './pages/Login';

/**
 * 1. Component Bảo vệ Route (ProtectedRoute)
 * Kiểm tra xem người dùng đã đăng nhập chưa và có đúng quyền không.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="p-10 text-center font-bold">Đang kiểm tra quyền truy cập...</div>;

    // Nếu chưa đăng nhập -> về trang Login
    if (!user) return <Navigate to="/login" replace />;

    // Nếu đã đăng nhập nhưng sai Role -> về trang chủ để tự điều hướng lại
    if (allowedRoles && !allowedRoles.includes(user.employeeType)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * 2. Component Điều hướng thông minh (RootRedirect)
 * Khi người dùng vào "/", Component này sẽ đưa họ đến đúng trang làm việc theo Role.
 */
const RootRedirect = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;
    if (!user) return <Navigate to="/login" replace />;

    // Logic điều hướng theo Role
    if (user.employeeType === 'Manager') {
        return <Navigate to="/manager/deposits" replace />;
    }
    if (user.employeeType === 'Sales') {
        return <Navigate to="/dang-ky-phong" replace />;
    }
    if (user.employeeType === 'Accounting') {
        return <Navigate to="/accounting/reconciliation" replace />;
    }

    return <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Route công khai */}
                    <Route path="/login" element={<Login />} />

                    {/* --- NHÓM ROUTE CỦA MANAGER --- */}
                    <Route path="/manager/deposits" element={
                        <ProtectedRoute allowedRoles={['Manager']}>
                            <DepositsManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/bienban" element={
                        <ProtectedRoute allowedRoles={['Manager']}>
                            <BienBan />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/rooms" element={
                        <ProtectedRoute allowedRoles={['Manager']}>
                            <RoomChecking />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/reconciliation" element={
                        <ProtectedRoute allowedRoles={['Manager']}>
                            <Reconciliation mode="manager" />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/management" element={
                        <ProtectedRoute allowedRoles={['Manager']}>
                            <Management />
                        </ProtectedRoute>
                    } />

                    {/* --- NHÓM ROUTE CỦA SALES --- */}
                    <Route path="/dang-ky-phong" element={
                        <ProtectedRoute allowedRoles={['Sales']}>
                            <RoomRegistration />
                        </ProtectedRoute>
                    } />
                    <Route path="/hen-lich" element={
                        <ProtectedRoute allowedRoles={['Sales']}>
                            <AppointmentScheduling />
                        </ProtectedRoute>
                    } />
                    <Route path="/xac-nhan-thue" element={<ProtectedRoute allowedRoles={['Sales']}><XacNhanThue /></ProtectedRoute>} />
                    <Route path="/thanh-toan-coc" element={<ProtectedRoute allowedRoles={['Sales']}><ThanhToanCoc /></ProtectedRoute>} />
                    <Route path="/lap-hop-dong" element={
                        <ProtectedRoute allowedRoles={['Sales']}>
                            <LapHopDong />
                        </ProtectedRoute>
                    } />
                    <Route path="/tra-phong" element={
                        <ProtectedRoute allowedRoles={['Sales']}>
                            <TraPhong />
                        </ProtectedRoute>
                    } />

                    {/* --- NHÓM ROUTE CỦA ACCOUNTING --- */}
                    <Route path="/accounting/reconciliation" element={
                        <ProtectedRoute allowedRoles={['Accounting']}>
                            <Reconciliation mode="accounting" />
                        </ProtectedRoute>
                    } />
                    <Route path="/accounting/phat-sinh" element={
                        <ProtectedRoute allowedRoles={['Accounting']}>
                            <AccountingPhatSinh />
                        </ProtectedRoute>
                    } />
                    <Route path="/accounting/hoan-coc" element={
                        <ProtectedRoute allowedRoles={['Accounting']}>
                            <AccountingHoanCoc />
                        </ProtectedRoute>
                    } />

                    {/* --- ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<RootRedirect />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
