import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  Edit2,
  X,
  Search
} from 'lucide-react';
import api from '../api/client';

export default function TimesheetPage({ user }) {
  const [month, setMonth] = useState('2026-09');
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  // Quản lý Modal sửa trực tiếp
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    time_in: '',
    time_out: '',
    status: 'Đúng giờ'
  });

  // Quyền Admin / HR được nạp và chỉnh sửa dữ liệu
  const userRole = (user?.role || user?.system_role || '').toString().trim().toLowerCase();
  const userName = (user?.username || user?.email || '').toString().trim().toLowerCase();
  
  const canManage = 
    userRole === 'admin' || 
    userRole === 'hr' || 
    userName === 'admin' || 
    userName === 'quan.tm@congty.vn' ||
    user?.department?.toLowerCase().includes('nhân sự');

  // Lấy dữ liệu bảng chấm công tháng từ backend
  const fetchMonthTimesheets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/timesheets/month', {
        params: {
          month,
          employeeCode: user?.employee_code || user?.employeeCode || 'HR001'
        }
      });
      setTimesheets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi tải bảng chấm công:', err);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  }, [month, user]);

  useEffect(() => {
    fetchMonthTimesheets();
  }, [fetchMonthTimesheets]);

  // Nạp file Excel chấm công
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/timesheets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'Nhập file Excel thành công!');
      await fetchMonthTimesheets();
    } catch (err) {
      alert('Lỗi nhập Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Mở modal sửa trực tiếp
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      time_in: item.time_in ? item.time_in.slice(0, 8) : '',
      time_out: item.time_out ? item.time_out.slice(0, 8) : '',
      status: item.status || 'Đúng giờ'
    });
    setEditModalOpen(true);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.put(`/timesheets/${editingItem.id}`, editForm);
      alert('Đã cập nhật dữ liệu chấm công!');
      setEditModalOpen(false);
      await fetchMonthTimesheets();
    } catch (err) {
      alert('Lỗi khi sửa: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePrevMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Lọc tìm kiếm theo tên hoặc mã nhân viên
  const filteredList = timesheets.filter(item => 
    (item.employee_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.formatted_date || item.date || '').includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Trang chủ &gt; Chấm công</div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-[#b9000b]" size={26} /> Quản lý chấm công
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bộ chọn tháng */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            <button 
              type="button" 
              onClick={handlePrevMonth} 
              className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft size={16} />
            </button>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="outline-none text-xs font-semibold text-slate-700 bg-transparent cursor-pointer px-1"
            />
            <button 
              type="button" 
              onClick={handleNextMonth} 
              className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* CHỈ GIỮ NÚT NHẬP FILE EXCEL DÀNH CHO ADMIN & HR */}
          {canManage && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet size={15} />
                <span>{uploading ? 'Đang nạp file...' : 'Nhập file Excel'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bảng dữ liệu chấm công từ file Excel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Bảng công tháng {month}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Tổng cộng: <strong>{filteredList.length}</strong> bản ghi từ file nạp
            </span>
          </div>

          {/* Ô tìm kiếm nhanh nhân viên / ngày */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Mã NV, Tên, Ngày..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3.5 px-4">Ngày</th>
                <th className="py-3.5 px-4">Mã NV</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4 text-center">Giờ vào</th>
                <th className="py-3.5 px-4 text-center">Giờ ra</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                {canManage && <th className="py-3.5 px-4 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="text-center py-12 text-slate-400">
                    Đang tải dữ liệu chấm công...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="text-center py-12 text-slate-400">
                    Không có dữ liệu chấm công trong tháng {month}.
                  </td>
                </tr>
              ) : (
                filteredList.map((ts, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {ts.formatted_date || ts.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-600">
                      {ts.employee_code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {ts.full_name || '---'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                      {ts.time_in ? ts.time_in.slice(0, 8) : '---'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                      {ts.time_out ? ts.time_out.slice(0, 8) : '---'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ts.status === 'Đúng giờ' || ts.status === 'Đủ công'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ts.status === 'Đi muộn'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ts.status || 'Đúng giờ'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ts)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-red-600 transition cursor-pointer"
                          title="Sửa công này"
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SỬA TRỰC TIẾP DÒNG CÔNG */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                Sửa chấm công: {editingItem.employee_code} ({editingItem.formatted_date || editingItem.date})
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Nhân viên
                </label>
                <input
                  type="text"
                  disabled
                  value={`${editingItem.full_name || 'Nhân viên'} (${editingItem.employee_code})`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Giờ vào (HH:mm:ss)
                  </label>
                  <input
                    type="text"
                    placeholder="08:15:00"
                    value={editForm.time_in}
                    onChange={(e) => setEditForm({ ...editForm, time_in: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Giờ ra (HH:mm:ss)
                  </label>
                  <input
                    type="text"
                    placeholder="17:30:00"
                    value={editForm.time_out}
                    onChange={(e) => setEditForm({ ...editForm, time_out: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white cursor-pointer"
                >
                  <option value="Đúng giờ">Đúng giờ</option>
                  <option value="Đủ công">Đủ công</option>
                  <option value="Đi muộn">Đi muộn</option>
                  <option value="Vắng mặt">Vắng mặt</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b9000b] hover:bg-[#a0000a] text-white rounded-xl font-semibold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}