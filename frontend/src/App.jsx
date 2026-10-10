import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';

// Các trang Quản lý / HR
import DashboardPage from './pages/DashboardPage';
import EmployeePage from './pages/EmployeePage';
import ApprovalPage from './pages/ApprovalPage';
import CalendarPage from './pages/CalendarPage';
import PayrollPage from './pages/PayrollPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Các trang Nhân viên / Dùng chung
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyRequestsPage from './pages/MyRequestsPage';
import TimesheetPage from './pages/TimesheetPage';
import MyProfilePage from './pages/MyProfilePage';
import CreateRequestModal from './pages/CreateRequestModal';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [tab, setTab] = useState('dashboard');

  // Quản lý Modal tạo đơn dùng chung
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('leave');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Nhận diện vai trò linh hoạt (bắt cả chữ hoa lẫn thường)
  const userRole = (user?.role || user?.system_role || '').toString().trim().toLowerCase();
  const userName = (user?.username || user?.email || '').toString().trim().toLowerCase();

  const isAdmin = 
    userRole === 'admin' || 
    userName === 'admin' || 
    userName === 'quan.tm@congty.vn';

  const isManager = 
    isAdmin ||
    userRole === 'quản lý' || 
    userRole === 'manager' || 
    userRole === 'hr' || 
    userRole === 'dr' || 
    user?.department?.toLowerCase().includes('nhân sự');

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setTab('dashboard');
  };

  if (!user || !token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafb] flex">
      <Sidebar tab={tab} setTab={setTab} onLogout={handleLogout} user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />

        <main className="p-8 flex-1 overflow-y-auto">
          {/* TAB 1: TỔNG QUAN */}
          {tab === 'dashboard' && (
            isManager ? (
              <DashboardPage setTab={setTab} user={user} />
            ) : (
              <EmployeeDashboard 
                user={user} 
                setTab={setTab} 
                onOpenModal={handleOpenModal} 
                refreshTrigger={refreshTrigger}
              />
            )
          )}

          {/* CÁC TAB QUẢN TRỊ / HR */}
          {tab === 'employees' && isManager && <EmployeePage user={user} />}
          {tab === 'requests' && isManager && <ApprovalPage user={user} />}
          {tab === 'calendar' && isManager && <CalendarPage user={user} />}

          {/* TAB BẢNG LƯƠNG (Cả 2 bên đều có quyền truy cập, Backend & Page tự lọc dữ liệu) */}
          {tab === 'payroll' && <PayrollPage user={user} />}

          {/* TAB CHẤM CÔNG (Cả 2 bên đều xem được, nút Nạp Excel chỉ hiện với HR/Admin) */}
          {tab === 'timesheet' && (
            <TimesheetPage user={user} onOpenModal={handleOpenModal} />
          )}

          {/* TAB DÀNH RIÊNG CHO QUẢN TRỊ VIÊN CẤP CAO (ADMIN ONLY) */}
          {tab === 'admin-settings' && isAdmin && <AdminSettingsPage user={user} />}

          {/* CÁC TAB CỦA NHÂN VIÊN */}
          {tab === 'my-requests' && !isManager && (
            <MyRequestsPage 
              user={user} 
              onOpenModal={handleOpenModal} 
              refreshTrigger={refreshTrigger} 
            />
          )}
          {tab === 'profile' && !isManager && (
            <MyProfilePage 
              user={user} 
              onOpenModal={handleOpenModal} 
            />
          )}
        </main>
      </div>

      {/* POPUP TẠO ĐƠN DÙNG CHUNG */}
      <CreateRequestModal
        isOpen={modalOpen}
        initialType={modalType}
        onClose={() => setModalOpen(false)}
        user={user}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}