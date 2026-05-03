import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DepositsManagement from './pages/manager/DepositsManagement';
import BienBan from './pages/manager/BienBan';
import RoomChecking from './pages/manager/RoomChecking';
import Reconciliation from './pages/manager/Reconciliation';
import Management from './pages/manager/Management';

function App() {
    return (
        <Router>
            <Routes>
                {/* Manager Routes */}
                <Route path="/manager/deposits" element={<DepositsManagement />} />
                <Route path="/manager/bienban" element={<BienBan />} />
                <Route path="/manager/rooms" element={<RoomChecking />} />
                <Route path="/manager/reconciliation" element={<Reconciliation />} />
                <Route path="/manager/management" element={<Management />} />

                {/* Redirect root to manager deposits */}
                <Route path="/" element={<Navigate to="/manager/deposits" replace />} />

                {/* Add more routes as needed */}
                <Route path="*" element={<Navigate to="/manager/deposits" replace />} />
            </Routes>
        </Router>
    );
}

export default App;