import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import IndexDashboard from './pages/dashboard/IndexDashboard';
import IncidentHistory from './pages/dashboard/citizen/IncidentHistory';
import Profile from './pages/dashboard/citizen/Profile';
import ReportIncident from './pages/dashboard/citizen/ReportIncident';
import LiveMap from './pages/dashboard/citizen/LiveMap';
import Notifications from './pages/dashboard/notifications/Notifications';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<IndexDashboard />} />
              <Route path="history" element={<IncidentHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="report" element={<ReportIncident />} />
              <Route path="map" element={<LiveMap />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer theme="dark" position="bottom-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
