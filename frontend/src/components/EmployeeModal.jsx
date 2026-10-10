import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, onSubmit, initialData, departments, positions }) {
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    gender: 'Nam',
    department_id: '',
    position_id: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        employee_code: '',
        full_name: '',
        email: '',
        phone: '',
        gender: 'Nam',
        department_id: departments[0]?.id || '',
        position_id: positions[0]?.id || '',
        status: 'ACTIVE',
      });
    }
  }, [initialData, departments, positions, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Mã NV *</label>
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                disabled={!!initialData}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Họ và Tên *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Khac">Khác</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Phòng ban</label>
              <select
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Chức vụ</label>
              <select
                value={formData.position_id || ''}
                onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-white"
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}