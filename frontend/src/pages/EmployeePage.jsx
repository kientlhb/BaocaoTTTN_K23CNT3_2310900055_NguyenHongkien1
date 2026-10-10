import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  X
} from 'lucide-react';
import api from '../api/client';

export default function EmployeePage({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: 'Phòng Kỹ thuật',
    role: '', // Chức vụ thực tế ngoài đời (Ví dụ: Kỹ sư phần mềm, Chuyên viên Nhân sự...)
    birthday: '',
    join_date: '',
    status: 'Đang làm việc',
    leave_days: '12/12',
    system_role: 'employee', // 3 quyền kỹ thuật: admin, hr, employee
    salary: 10000000
  });

  // Nhận diện quyền Admin triệt để (xử lý cả chữ in hoa 'ADMIN', chữ thường 'admin' và username)
  const userRole = (user?.role || user?.system_role || '').toString().trim().toLowerCase();
  const userName = (user?.username || user?.email || '').toString().trim().toLowerCase();

  const isAdmin = 
    userRole === 'admin' || 
    userName === 'admin' || 
    userName === 'quan.tm@congty.vn';

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          search: search || undefined,
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Lỗi lấy danh sách nhân viên:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        full_name: emp.full_name || '',
        email: emp.email || '',
        phone: emp.phone || '',
        department: emp.department || 'Phòng Kỹ thuật',
        role: emp.role || '',
        birthday: emp.birthday ? emp.birthday.slice(0, 10) : '',
        join_date: emp.join_date ? emp.join_date.slice(0, 10) : '',
        status: emp.status || 'Đang làm việc',
        leave_days: emp.leave_days || '12/12',
        system_role: (emp.system_role || 'employee').toLowerCase(),
        salary: emp.salary ? Math.round(Number(emp.salary)) : 10000000
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        department: 'Phòng Kỹ thuật',
        role: '',
        birthday: '',
        join_date: new Date().toISOString().slice(0, 10),
        status: 'Đang làm việc',
        leave_days: '12/12',
        system_role: 'employee',
        salary: 10000000
      });
    }
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.employee_code || editingEmployee.id}`, formData);
        alert('Cập nhật thông tin nhân viên thành công!');
      } else {
        await api.post('/employees', formData);
        alert('Thêm nhân viên mới thành công!');
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (error) {
      alert('Lỗi lưu thông tin: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatVND = (num) => Number(num || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 mb-1">Trang chủ &gt; Nhân viên</div>
          <h2 className="text-2xl font-bold text-slate-800">Danh sách nhân sự</h2>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-[#b9000b] hover:bg-[#a0000a] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none bg-white text-slate-600 cursor-pointer"
          >
            <option value="all">Tất cả phòng ban</option>
            <option value="Phòng Kỹ thuật">Phòng Kỹ thuật</option>
            <option value="Phòng Nhân sự">Phòng Nhân sự</option>
            <option value="Phòng Kinh doanh">Phòng Kinh doanh</option>
            <option value="Ban Giám đốc">Ban Giám đốc</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none bg-white text-slate-600 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc</option>
            <option value="Đã khóa">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Danh sách nhân viên */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
              <th className="py-3.5 px-4">Nhân viên</th>
              <th className="py-3.5 px-4">Mã NV</th>
              <th className="py-3.5 px-4">Phòng ban</th>
              <th className="py-3.5 px-4">Chức vụ công việc</th>
              <th className="py-3.5 px-4 text-center">Vai trò hệ thống</th>
              <th className="py-3.5 px-4 text-right">Lương cơ bản</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  Đang tải danh sách nhân viên...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  Không tìm thấy nhân viên nào phù hợp.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const sysRole = (emp.system_role || 'employee').toLowerCase();
                return (
                  <tr key={emp.employee_code} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-800">{emp.full_name}</div>
                        <div className="text-[11px] text-slate-400">{emp.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-600">{emp.employee_code}</td>
                    <td className="py-3.5 px-4 text-slate-600">{emp.department || '---'}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {emp.role || 'Chưa cập nhật'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sysRole === 'admin'
                            ? 'bg-red-100 text-red-700'
                            : sysRole === 'hr'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sysRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {formatVND(emp.salary)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Đang làm việc' || emp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {emp.status === 'ACTIVE' ? 'Đang làm việc' : (emp.status || 'Đang làm việc')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(emp)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        title="Sửa nhân viên"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa Nhân Viên */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingEmployee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Mã nhân viên
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingEmployee ? editingEmployee.employee_code : 'Tự động tạo (NVxxx)'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email công việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Phòng ban <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white cursor-pointer"
                  >
                    <option value="Phòng Kỹ thuật">Phòng Kỹ thuật</option>
                    <option value="Phòng Nhân sự">Phòng Nhân sự</option>
                    <option value="Phòng Kinh doanh">Phòng Kinh doanh</option>
                    <option value="Ban Giám đốc">Ban Giám đốc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Lương cơ bản (đ)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                  />
                </div>
              </div>

              {/* HÀNG: CHỨC VỤ VÀ VAI TRÒ HỆ THỐNG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* 1. CHỨC VỤ (role): Ô nhập tự do chức danh thực tế */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Chức vụ công việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    placeholder="Ví dụ: Chuyên viên Nhân sự, Kỹ sư phần mềm, Trưởng phòng..."
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                  />
                </div>

                {/* 2. VAI TRÒ HỆ THỐNG (system_role): 3 quyền chuẩn, khóa đối với HR, mở khóa cho Admin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>Vai trò hệ thống</span>
                    {!isAdmin && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-normal">
                        Chỉ Admin được đổi
                      </span>
                    )}
                  </label>
                  <select
                    name="system_role"
                    value={formData.system_role}
                    onChange={handleChange}
                    disabled={!isAdmin} // Khi isAdmin = true thì ô này mở khóa bình thường
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none transition ${
                      !isAdmin
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
                        : 'bg-white border-slate-200 focus:border-red-500 cursor-pointer'
                    }`}
                  >
                    <option value="employee">Nhân viên (Employee)</option>
                    <option value="hr">Nhân sự (HR)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white cursor-pointer"
                  >
                    <option value="Đang làm việc">Đang làm việc</option>
                    <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                    <option value="Đã khóa">Đã khóa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Quỹ phép năm
                  </label>
                  <input
                    type="text"
                    name="leave_days"
                    value={formData.leave_days}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b9000b] hover:bg-[#a0000a] text-white rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                >
                  {editingEmployee ? 'Lưu thay đổi' : 'Tạo nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}