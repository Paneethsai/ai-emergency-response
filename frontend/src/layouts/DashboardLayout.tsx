import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
