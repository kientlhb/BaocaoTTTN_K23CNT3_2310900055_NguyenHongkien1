import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
          <tr>
            <th className="p-4">Mã NV</th>
            <th className="p-4">Họ và Tên</th>
            <th className="p-4">Email / SĐT</th>
            <th className="p-4">Phòng ban</th>
            <th className="p-4">Chức vụ</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {employees.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-8 text-center text-slate-400">
                Không tìm thấy nhân viên phù hợp.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-semibold text-red-600">{emp.employee_code}</td>
                <td className="p-4 font-medium text-slate-800">{emp.full_name}</td>
                <td className="p-4 text-slate-500">
                  <div>{emp.email}</div>
                  <div className="text-xs text-slate-400">{emp.phone}</div>
                </td>
                <td className="p-4">{emp.department_name || '-'}</td>
                <td className="p-4">{emp.position_title || '-'}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {emp.status === 'ACTIVE' ? 'Hoạt động' : 'Đã nghỉ việc'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => onEdit(emp)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(emp.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}