import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DepositsManagement from './pages/manager/DepositsManagement';
import BienBan from './pages/manager/BienBan';
import RoomChecking from './pages/manager/RoomChecking';
import Reconciliation from './pages/manager/Reconciliation';
import Management from './pages/manager/Management';
import RoomRegistration from './pages/saleEmployee/RoomRegistration';
import AppointmentScheduling from './pages/saleEmployee/AppointmentScheduling';

function App() {
    return (
        <Router>
            <Routes>
                {/* 1. Manager Routes */}
                <Route path="/manager/deposits" element={<DepositsManagement />} />
                <Route path="/manager/bienban" element={<BienBan />} />
                <Route path="/manager/rooms" element={<RoomChecking />} />
                <Route path="/manager/reconciliation" element={<Reconciliation />} />
                <Route path="/manager/management" element={<Management />} />

                {/* 2. Sale Employee Routes (Đã chuyển lên trên dấu *) */}
                <Route path="/dang-ky-phong" element={<RoomRegistration />} />
                <Route path="/hen-lich" element={<AppointmentScheduling />} />

                {/* 3. Điều hướng mặc định - LUÔN ĐỂ Ở CUỐI CÙNG */}
                <Route path="/" element={<Navigate to="/manager/deposits" replace />} />
                <Route path="*" element={<Navigate to="/manager/deposits" replace />} />
            </Routes>
        </Router>
    );
}

export default App;