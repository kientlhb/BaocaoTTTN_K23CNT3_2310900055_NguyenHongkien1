import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Calendar, Clock, AlertCircle, Plus, Eye, X, Send, CheckCircle2, Info } from 'lucide-react';
import AttendanceCard from '../components/AttendanceCard';

export default function EmployeeDashboard({ user, setTab, onOpenModal }) {
  // Quản lý Modal: 'leave' (Nghỉ phép), 'timesheet' (Bổ sung công), null (Đóng)
  const [modalType, setModalType] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dữ liệu lấy trực tiếp từ database PostgreSQL
  const [myRequests, setMyRequests] = useState([]);

  // Form Đơn Nghỉ phép (Khớp 100% ảnh giao diện)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Phép năm',
    workFormat: 'Cả ngày',
    fromDate: '05/10/2026',
    toDate: '05/10/2026',
    reason: ''
  });

  // Form Đơn Bổ sung công
  const [timesheetForm, setTimesheetForm] = useState({
    date: '18/09/2026',
    timeIn: '08:00 SA',
    timeOut: '05:30 CH',
    reasonCategory: 'Quên chấm công',
    description: ''
  });

  // 1. TẢI DỮ LIỆU ĐỘNG TỪ BẢNG leave_requests TRONG POSTGRESQL
  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      if (Array.isArray(res.data)) {
        const empCode = user?.employeeCode || 'NV002';
        const empName = user?.fullName || 'Nguyễn Thu Hà';

        // Lọc đúng các đơn thuộc về nhân viên đang đăng nhập
        const filtered = res.data.filter(r => 
          r.employee_code === empCode || 
          r.employee_name === empName ||
          r.name === empName
        );

        setMyRequests(filtered);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu từ PostgreSQL:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [user]);

  // 2. GỬI ĐƠN NGHỈ PHÉP LƯU TRỰC TIẾP VÀO POSTGRESQL
  const handleSendLeaveRequest = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      alert('Vui lòng nhập lý do / mô tả!');
      return;
    }

    setSubmitting(true);
    const payload = {
      employee_name: user?.fullName || 'Nguyễn Thu Hà',
      employee_code: user?.employeeCode || 'NV002',
      department: user?.department || 'Phòng Kỹ thuật',
      avatar: user?.fullName ? user.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'NH',
      request_type: leaveForm.leaveType,
      time_range: leaveForm.fromDate === leaveForm.toDate 
        ? `${leaveForm.fromDate} · 1 ngày` 
        : `${leaveForm.fromDate} – ${leaveForm.toDate} · 2 ngày`,
      reason: `[${leaveForm.workFormat}] ${leaveForm.reason}`
    };

    try {
      await api.post('/requests', payload);
      alert('Đã gửi đơn nghỉ phép thành công vào cơ sở dữ liệu!');
      setModalType(null);
      setLeaveForm({
        leaveType: 'Phép năm',
        workFormat: 'Cả ngày',
        fromDate: '05/10/2026',
        toDate: '05/10/2026',
        reason: ''
      });
      await fetchMyRequests();
    } catch (err) {
      console.error('Lỗi khi INSERT SQL:', err);
      alert('Gửi đơn thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. GỬI ĐƠN BỔ SUNG CÔNG LƯU TRỰC TIẾP VÀO POSTGRESQL
  const handleSendTimesheetRequest = async (e) => {
    e.preventDefault();
    if (!timesheetForm.description.trim()) {
      alert('Vui lòng nhập lý do / mô tả!');
      return;
    }

    setSubmitting(true);
    const payload = {
      employee_name: user?.fullName || 'Nguyễn Thu Hà',
      employee_code: user?.employeeCode || 'NV002',
      department: user?.department || 'Phòng Kỹ thuật',
      avatar: user?.fullName ? user.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'NH',
      request_type: 'Bổ sung công',
      time_range: `${timesheetForm.date} · ${timesheetForm.timeIn} – ${timesheetForm.timeOut}`,
      reason: `${timesheetForm.reasonCategory}: ${timesheetForm.description}`
    };

    try {
      await api.post('/requests', payload);
      alert('Đã gửi đơn bổ sung công thành công vào cơ sở dữ liệu!');
      setModalType(null);
      setTimesheetForm({
        date: '18/09/2026',
        timeIn: '08:00 SA',
        timeOut: '05:30 CH',
        reasonCategory: 'Quên chấm công',
        description: ''
      });
      await fetchMyRequests();
    } catch (err) {
      console.error('Lỗi khi INSERT SQL:', err);
      alert('Gửi đơn thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Số liệu động tính trực tiếp từ SQL
  const pendingCount = myRequests.filter(r => r.status === 'Chờ duyệt').length;
  const compCount = myRequests.filter(r => (r.request_type || r.type) === 'Bổ sung công').length;

  return (
    <div className="space-y-6">
      {/* Tiêu đề & 2 Nút thao tác góc phải */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">Tổng quan</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tổng quan</h2>
        </div>

        {/* 2 nút thao tác góc trên bên phải */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onOpenModal ? onOpenModal('timesheet') : setModalType('timesheet')}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
          >
            <Clock size={15} className="text-slate-500" />
            <span>Đơn bổ sung công</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal ? onOpenModal('leave') : setModalType('leave')}
            className="flex items-center space-x-2 bg-[#b9000b] hover:bg-[#a0000a] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Đơn nghỉ phép</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ thống kê */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Phép năm còn lại</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">8</div>
            <div className="text-[11px] text-slate-400 mt-1">Trên tổng 12 ngày</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đơn chờ duyệt</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{pendingCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Đang chờ quản lý xử lý</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Bổ sung công tháng 9</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{compCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Tối đa 3 lần/tháng</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Ngày thiếu công</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">1</div>
            <div className="text-[11px] text-slate-400 mt-1">18/09/2026 thiếu giờ ra</div>
          </div>
        </div>
      </div>

      {/* Grid: Bảng Đơn gần đây & Quỹ phép năm 2026 */}
      <div className="grid grid-cols-3 gap-6 items-start">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Đơn gần đây</h3>
            <button
              type="button"
              onClick={() => setTab && setTab('my-requests')}
              className="text-xs text-[#b9000b] font-semibold hover:underline cursor-pointer"
            >
              Xem tất cả &rarr;
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Đang nạp dữ liệu từ PostgreSQL...</div>
          ) : myRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Chưa có đơn nào trong cơ sở dữ liệu.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 pb-2">
                  <th className="py-2.5 font-medium">Mã đơn</th>
                  <th className="py-2.5 font-medium">Loại đơn</th>
                  <th className="py-2.5 font-medium">Thời gian</th>
                  <th className="py-2.5 font-medium">Trạng thái</th>
                  <th className="py-2.5 font-medium text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((r, i) => {
                  const isPending = r.status === 'Chờ duyệt';
                  const isApproved = r.status === 'Đã duyệt';
                  const code = r.request_code || r.code || `DT-${r.id}`;
                  const type = r.request_type || r.type;
                  const time = r.time_range || r.time;

                  return (
                    <tr key={r.id || i} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 font-bold text-red-600">{code}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                          {type}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-700">{time}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          isPending
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : isApproved
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isPending ? 'bg-amber-500' : isApproved ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReq(r)}
                          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-sm">Quỹ phép năm 2026</h3>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-[#b9000b]">8</span>
              <span className="text-xs text-slate-500 font-medium">/ 12 ngày còn lại</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-[#b9000b] h-full rounded-full transition-all duration-300" style={{ width: `${(8 / 12) * 100}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <div className="text-slate-400 mb-0.5">Đã sử dụng</div>
              <div className="font-bold text-slate-800 text-sm">4 ngày</div>
            </div>
            <div>
              <div className="text-slate-400 mb-0.5">Đang chờ duyệt</div>
              <div className="font-bold text-slate-800 text-sm">{pendingCount} ngày</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL TẠO ĐƠN MỚI (CHUẨN 100% THEO THIẾT KẾ ẢNH)
      ======================================================== */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[560px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Tạo đơn mới</h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Switch: Nghỉ phép / Bổ sung công */}
            <div className="px-6 pt-5">
              <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalType('leave')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    modalType === 'leave'
                      ? 'bg-white text-[#b9000b] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={14} />
                  <span>Nghỉ phép</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('timesheet')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    modalType === 'timesheet'
                      ? 'bg-white text-[#b9000b] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock size={14} />
                  <span>Bổ sung công</span>
                </button>
              </div>
            </div>

            {/* 1. FORM ĐƠN NGHỈ PHÉP (CHUẨN 100% THEO ẢNH BẠN GỬI) */}
            {modalType === 'leave' && (
              <form onSubmit={handleSendLeaveRequest}>
                <div className="p-6 space-y-4 text-xs">
                  {/* Hàng 1: Loại nghỉ * & Hình thức * */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Loại nghỉ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="Phép năm">Phép năm</option>
                        <option value="Nghỉ ốm">Nghỉ ốm</option>
                        <option value="Nghỉ không lương">Nghỉ không lương</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Hình thức <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={leaveForm.workFormat}
                        onChange={(e) => setLeaveForm({ ...leaveForm, workFormat: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="Cả ngày">Cả ngày</option>
                        <option value="Buổi sáng">Buổi sáng</option>
                        <option value="Buổi chiều">Buổi chiều</option>
                      </select>
                    </div>
                  </div>

                  {/* Hàng 2: Từ ngày * & Đến ngày * */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Từ ngày <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={leaveForm.fromDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Đến ngày <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={leaveForm.toDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Callout Info màu xanh dương */}
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center space-x-2 text-xs text-blue-700">
                    <Info size={16} className="text-blue-600 flex-shrink-0" />
                    <span>Số ngày nghỉ: 1 ngày. Phép năm còn lại sau khi duyệt: 7 ngày.</span>
                  </div>

                  {/* Lý do / mô tả * */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Lý do / mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Nhập lý do"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none text-xs"
                    />
                  </div>
                </div>

                {/* Footer Modal: Người duyệt bên trái, Hủy & Gửi đơn bên phải */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Người duyệt: <strong className="text-slate-800">Trần Minh Quân</strong>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>{submitting ? 'Đang lưu SQL...' : 'Gửi đơn'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. FORM ĐƠN BỔ SUNG CÔNG */}
            {modalType === 'timesheet' && (
              <form onSubmit={handleSendTimesheetRequest}>
                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Ngày cần bổ sung <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={timesheetForm.date}
                          onChange={(e) => setTimesheetForm({ ...timesheetForm, date: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Giờ vào <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={timesheetForm.timeIn}
                          onChange={(e) => setTimesheetForm({ ...timesheetForm, timeIn: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Giờ ra <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={timesheetForm.timeOut}
                          onChange={(e) => setTimesheetForm({ ...timesheetForm, timeOut: e.target.value })}
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Lý do bổ sung <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={timesheetForm.reasonCategory}
                      onChange={(e) => setTimesheetForm({ ...timesheetForm, reasonCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white"
                    >
                      <option value="Quên chấm công">Quên chấm công</option>
                      <option value="Gặp khách hàng ngoài văn phòng">Gặp khách hàng ngoài văn phòng</option>
                      <option value="Máy chấm công bị lỗi">Máy chấm công bị lỗi</option>
                      <option value="Công tác xa">Công tác xa</option>
                    </select>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-slate-600">
                    <CheckCircle2 size={16} className="text-slate-400 flex-shrink-0" />
                    <span>Dữ liệu máy chấm công ngày 18/09/2026: vào 08:04, ra --:--.</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Lý do / mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Nhập lý do"
                      value={timesheetForm.description}
                      onChange={(e) => setTimesheetForm({ ...timesheetForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Người duyệt: <strong className="text-slate-800">Trần Minh Quân</strong>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>{submitting ? 'Đang lưu SQL...' : 'Gửi đơn'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POPUP XEM CHI TIẾT ĐƠN */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[480px] p-6 space-y-4 text-xs text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                Chi tiết đơn {selectedReq.request_code || selectedReq.code || selectedReq.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong className="text-slate-600">Loại đơn:</strong> {selectedReq.request_type || selectedReq.type}</p>
              <p><strong className="text-slate-600">Thời gian:</strong> {selectedReq.time_range || selectedReq.time}</p>
              <p><strong className="text-slate-600">Lý do:</strong> {selectedReq.reason}</p>
              <p><strong className="text-slate-600">Trạng thái:</strong> {selectedReq.status}</p>
              {selectedReq.approved_by && (
                <p><strong className="text-slate-600">Người duyệt:</strong> {selectedReq.approved_by}</p>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}