import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Calendar, Clock, X, Send, CheckCircle2, Info, Check } from 'lucide-react';

export default function CreateRequestModal({ isOpen, initialType = 'leave', onClose, user, onSuccess }) {
  const [modalType, setModalType] = useState(initialType);
  const [submitting, setSubmitting] = useState(false);
  
  // Trạng thái hiển thị Popup Thành công
  const [successInfo, setSuccessInfo] = useState(null);

  // Form Đơn Nghỉ phép
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

  useEffect(() => {
    setModalType(initialType);
    setSuccessInfo(null);
  }, [initialType, isOpen]);

  if (!isOpen) return null;

  // GỬI ĐƠN NGHỈ PHÉP
  const handleSendLeave = async (e) => {
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
      const res = await api.post('/requests', payload);
      if (onSuccess) onSuccess();
      // Hiển thị Popup thành công
      setSuccessInfo({
        code: res.data?.request_code || 'DT-Mới',
        type: 'Đơn nghỉ phép',
        message: 'Đơn nghỉ phép của bạn đã được gửi thành công đến quản lý Trần Minh Quân để phê duyệt.'
      });
    } catch (err) {
      console.error('Lỗi khi INSERT SQL:', err);
      alert('Gửi đơn thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // GỬI ĐƠN BỔ SUNG CÔNG
  const handleSendTimesheet = async (e) => {
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
      const res = await api.post('/requests', payload);
      if (onSuccess) onSuccess();
      // Hiển thị Popup thành công
      setSuccessInfo({
        code: res.data?.request_code || 'DT-Mới',
        type: 'Đơn bổ sung công',
        message: 'Đơn bổ sung công của bạn đã được gửi thành công đến quản lý Trần Minh Quân để phê duyệt.'
      });
    } catch (err) {
      console.error('Lỗi khi INSERT SQL:', err);
      alert('Gửi đơn thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAll = () => {
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      {/* POPUP THÔNG BÁO GỬI THÀNH CÔNG */}
      {successInfo ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[420px] p-7 text-center animate-in fade-in zoom-in-95 duration-150 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check size={32} strokeWidth={3} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800">Gửi đơn thành công!</h3>
            <p className="text-xs text-slate-400 mt-1">Mã đơn: <strong className="text-[#b9000b]">{successInfo.code}</strong></p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {successInfo.message}
          </p>

          <button
            type="button"
            onClick={handleCloseAll}
            className="w-full py-3 bg-[#b9000b] hover:bg-[#a0000a] text-white text-xs font-bold rounded-xl transition shadow-md shadow-red-200 active:scale-95 cursor-pointer"
          >
            Đã hiểu & Hoàn tất
          </button>
        </div>
      ) : (
        /* FORM TẠO ĐƠN CHÍNH */
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[560px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Header Modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">Tạo đơn mới</h3>
            <button
              type="button"
              onClick={onClose}
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

          {/* 1. FORM ĐƠN NGHỈ PHÉP */}
          {modalType === 'leave' && (
            <form onSubmit={handleSendLeave}>
              <div className="p-6 space-y-4 text-xs">
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

                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center space-x-2 text-xs text-blue-700">
                  <Info size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Số ngày nghỉ: 1 ngày. Phép năm còn lại sau khi duyệt: 7 ngày.</span>
                </div>

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

              <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Người duyệt: <strong className="text-slate-800">Trần Minh Quân</strong>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={onClose}
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
            <form onSubmit={handleSendTimesheet}>
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
                    onClick={onClose}
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
      )}
    </div>
  );
}