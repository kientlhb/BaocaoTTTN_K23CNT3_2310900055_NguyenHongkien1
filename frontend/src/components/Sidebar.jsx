import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  LogOut, 
  DollarSign,
  ShieldCheck 
} from 'lucide-react';

export default function Sidebar({ tab, setTab, onLogout, user }) {
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

  // Menu Quản lý / HR
  const managerMenu = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'employees', label: 'Nhân viên', icon: Users },
    { id: 'timesheet', label: 'Chấm công', icon: Clock },
    { id: 'requests', label: 'Duyệt đơn', icon: ClipboardCheck, badge: 4 },
    { id: 'calendar', label: 'Lịch nghỉ', icon: Calendar },
    { id: 'payroll', label: 'Bảng lương', icon: DollarSign },
  ];

  // Thêm mục Phân quyền chỉ dành riêng cho Admin
  if (isAdmin) {
    managerMenu.push({
      id: 'admin-settings',
      label: 'Quản trị & Phân quyền',
      icon: ShieldCheck
    });
  }

  // Menu Nhân viên thông thường
  const employeeMenu = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'my-requests', label: 'Đơn của tôi', icon: FileText, badge: 1 },
    { id: 'timesheet', label: 'Chấm công', icon: Clock },
    { id: 'payroll', label: 'Bảng lương', icon: DollarSign },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
  ];

  const currentMenu = isManager ? managerMenu : employeeMenu;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-[#b9000b] rounded-xl flex items-center justify-center text-white shadow-sm font-bold">
            <Users size={22} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">Quản lý nhân sự</h1>
            <p className="text-[11px] text-slate-400">Nhân viên · Đơn từ</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="p-4">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">
            {isAdmin ? 'QUẢN TRỊ VIÊN' : isManager ? 'QUẢN LÝ / HR' : 'NHÂN VIÊN'}
          </p>

          <nav className="space-y-1">
            {currentMenu.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-[#b9000b] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={isActive ? 'text-[#b9000b]' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 bg-[#b9000b] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Đăng xuất */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}