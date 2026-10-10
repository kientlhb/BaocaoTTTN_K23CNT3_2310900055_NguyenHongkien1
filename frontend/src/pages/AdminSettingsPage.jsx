import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, Lock, Unlock, KeyRound } from 'lucide-react';
import api from '../api/client';

export default function AdminSettingsPage({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // 1. Tải danh sách tài khoản
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách tài khoản:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Cập nhật quyền kỹ thuật (system_role)
  const handleRoleChange = async (emp, newRole) => {
    try {
      const targetId = emp.employee_code || emp.id;
      const res = await api.put(`/admin/users/${targetId}/role`, { role: newRole });
      alert(res.data.message || 'Cập nhật vai trò hệ thống thành công!');
      
      // Cập nhật ngay state trên UI
      setEmployees(prev => prev.map(item => {
        if ((item.employee_code || item.id) === targetId) {
          return { ...item, system_role: newRole };
        }
        return item;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật quyền: ' + err.message);
    }
  };

  // 3. Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (emp) => {
    const currentStatus = emp.status || 'Đang làm việc';
    const newStatus = currentStatus === 'Đã khóa' ? 'Đang làm việc' : 'Đã khóa';

    if (!window.confirm(`Bạn có chắc chắn muốn ${newStatus === 'Đã khóa' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản của ${emp.full_name}?`)) {
      return;
    }

    try {
      const targetId = emp.employee_code || emp.id;
      const res = await api.put(`/admin/users/${targetId}/status`, { status: newStatus });
      alert(res.data.message || 'Cập nhật trạng thái tài khoản thành công!');
      
      setEmployees(prev => prev.map(item => {
        if ((item.employee_code || item.id) === targetId) {
          return { ...item, status: newStatus };
        }
        return item;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đổi trạng thái: ' + err.message);
    }
  };

  // 4. Reset mật khẩu về mặc định
  const handleResetPassword = async (emp) => {
    if (!window.confirm(`Reset mật khẩu của ${emp.full_name} (${emp.employee_code}) về mặc định (123456)?`)) {
      return;
    }

    try {
      const targetId = emp.employee_code || emp.id;
      const res = await api.post(`/admin/users/${targetId}/reset-password`);
      alert(res.data.message || 'Mật khẩu đã được reset về: 123456');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi reset mật khẩu: ' + err.message);
    }
  };

  // Lọc theo tìm kiếm
  const filteredEmployees = employees.filter(emp => 
    (emp.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.employee_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Hệ thống &gt; Phân quyền quản trị</div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-[#b9000b]" size={26} /> Quản trị tài khoản &amp; Phân quyền
          </h2>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã NV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Bảng danh sách phân quyền */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
              <th className="py-3.5 px-4">Mã NV</th>
              <th className="py-3.5 px-4">Họ và tên</th>
              <th className="py-3.5 px-4">Phòng ban</th>
              <th className="py-3.5 px-4">Quyền hạn (Role)</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Hành động bảo mật (Admin)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Không tìm thấy tài khoản nào.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                // ƯU TIÊN LẤY system_role CHUẨN KỸ THUẬT (3 QUYỀN)
                const currentRole = (emp.system_role || 'employee').toLowerCase();
                const isLocked = emp.status === 'Đã khóa';

                return (
                  <tr key={emp.employee_code} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-red-600">{emp.employee_code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.full_name}</div>
                      <div className="text-[11px] text-slate-400">{emp.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{emp.department || '---'}</td>
                    
                    {/* DROPDOWN PHÂN QUYỀN: CHỌN VÀ ĐỔI TRỰC TIẾP */}
                    <td className="py-3.5 px-4">
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(emp, e.target.value)}
                        className={`px-3 py-1.5 border rounded-xl text-xs outline-none font-medium cursor-pointer transition ${
                          currentRole === 'admin'
                            ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                            : currentRole === 'hr'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="employee">Nhân viên (Employee)</option>
                        <option value="hr">Nhân sự (HR)</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                      </select>
                    </td>

                    {/* TRẠNG THÁI */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isLocked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isLocked ? 'Đã khóa' : 'Đang làm việc'}
                      </span>
                    </td>

                    {/* NÚT THAO TÁC (KHÓA/MỞ KHÓA & RESET PASS) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(emp)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isLocked
                              ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetPassword(emp)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                          title="Reset mật khẩu về 123456"
                        >
                          <KeyRound size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}