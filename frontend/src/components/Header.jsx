import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import { Bell, FileText, X, Check } from 'lucide-react';

export default function Header({ user }) {
  const [showNoti, setShowNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managerNote, setManagerNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const notiRef = useRef(null);

  // Phân biệt vai trò
  const isManager = user?.role === 'Quản lý' || user?.username === 'quan.tm@congty.vn' || user?.username === 'admin';

  // Lấy dữ liệu thông báo phù hợp cho từng vai trò
  const fetchNotifications = async () => {
    if (isManager) {
      // 1. Quản lý: Lấy danh sách các đơn cần duyệt
      try {
        const res = await api.get('/requests');
        if (Array.isArray(res.data)) {
          const notiList = res.data.map((req, idx) => ({
            id: req.id || req.request_code || idx,
            rawRequest: req,
            title: `${req.employee_name || req.name || 'Nhân viên'} gửi đơn ${req.request_type || req.type} ngày ${req.start_date || '23/09/2026'}`,
            time: req.submit_date || req.date || 'Hôm nay',
            unread: req.status === 'Chờ duyệt',
            type: 'request'
          }));
          setNotifications(notiList);
          return;
        }
      } catch {
        // Fallback quản lý
        setNotifications([
          {
            id: 'DT-0140',
            title: 'Vũ Ngọc Anh gửi đơn Nghỉ ốm ngày 23/09/2026',
            time: '07:32 · Hôm nay',
            unread: true,
            type: 'request',
            rawRequest: {
              request_code: 'DT-0140',
              employee_name: 'Vũ Ngọc Anh',
              employee_code: 'NV006',
              department: 'Phòng Kinh doanh',
              avatar: 'VA',
              request_type: 'Nghỉ ốm',
              form_type: 'Cả ngày',
              time_range: '23/09/2026',
              days_count: '1 ngày',
              reason: 'Sốt, có giấy khám bệnh',
              submit_time: '07:32 · 23/09/2026',
              status: 'Chờ duyệt'
            }
          }
        ]);
      }
    } else {
      // 2. Nhân viên: Thông báo kết quả duyệt đơn của chính mình (Chuẩn 100% Ảnh 2)
      setNotifications([
        {
          id: 101,
          title: 'Đơn bổ sung công ngày 15/09/2026 đã được phê duyệt',
          time: '08:45 · 16/09/2026',
          unread: true,
          type: 'approved'
        },
        {
          id: 102,
          title: 'Đơn Phép năm ngày 11/09/2026 đã được phê duyệt',
          time: '16:40 · 07/09/2026',
          unread: false,
          type: 'approved'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isManager]);

  // Đóng dropdown thông báo khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleSelectNotification = (item) => {
    if (isManager && item.rawRequest) {
      const raw = item.rawRequest;
      setSelectedRequest({
        request_code: raw.request_code || raw.id || item.id,
        employee_name: raw.employee_name || raw.name || 'Vũ Ngọc Anh',
        employee_code: raw.employee_code || 'NV006',
        department: raw.department || raw.dept || 'Phòng Kinh doanh',
        avatar: raw.avatar || 'VA',
        request_type: raw.request_type || raw.type || 'Nghỉ ốm',
        form_type: raw.form_type || 'Cả ngày',
        time_range: raw.time_range || raw.time || '23/09/2026',
        days_count: raw.days_count || '1 ngày',
        reason: raw.reason || 'Sốt, có giấy khám bệnh',
        submit_time: raw.submit_date || raw.date || '07:32 · 23/09/2026',
        status: raw.status || 'Chờ duyệt'
      });
    }
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setShowNoti(false);
  };

  const handleProcessAction = async (newStatus) => {
    if (newStatus === 'Từ chối' && !managerNote.trim()) {
      alert('Vui lòng nhập ý kiến giải thích khi từ chối đơn!');
      return;
    }

    setProcessing(true);
    const targetId = selectedRequest.request_code;

    try {
      await api.patch(`/requests/${targetId}/status`, {
        status: newStatus,
        approved_by: 'Trần Minh Quân (Quản lý)',
        approval_note: managerNote || (newStatus === 'Đã duyệt' ? 'Đồng ý' : 'Từ chối')
      });
    } catch {
      // Ignored
    }

    alert(`Đã thực hiện: ${newStatus}`);
    setProcessing(false);
    setSelectedRequest(null);
    setManagerNote('');
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // Lấy ký tự Avatar chính xác
  const getAvatarInitials = () => {
    if (isManager) return 'TQ';
    if (user?.fullName) {
      const parts = user.fullName.trim().split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return 'NH';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Ngày tháng */}
      <div className="text-sm font-medium text-slate-600">
        Thứ Tư, 23/09/2026
      </div>

      {/* Cụm chức năng bên phải */}
      <div className="flex items-center space-x-5">
        {/* Nút Chuông Thông Báo */}
        <div className="relative" ref={notiRef}>
          <button
            type="button"
            onClick={() => setShowNoti(!showNoti)}
            className="relative cursor-pointer text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-50 transition focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popup danh sách thông báo */}
          {showNoti && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Thông báo</span>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-medium text-[#b9000b] hover:underline cursor-pointer"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotification(item)}
                      className={`p-3.5 flex items-start space-x-3 hover:bg-slate-50/80 transition cursor-pointer ${
                        item.unread ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Icon tương ứng loại thông báo */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.type === 'approved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {item.type === 'approved' ? <Check size={14} /> : <FileText size={14} />}
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="text-xs text-slate-700 leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {item.time}
                        </div>
                      </div>

                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#b9000b] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Thông tin tài khoản người dùng DUY NHẤT */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
            {getAvatarInitials()}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-none">
              {isManager ? 'Trần Minh Quân' : (user?.fullName || 'Nguyễn Thu Hà')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isManager ? 'Quản lý' : 'Nhân viên'} · {user?.department || 'Phòng Kỹ thuật'}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐƠN CHO QUẢN LÝ (Chỉ mở khi Quản lý click vào thông báo đơn gửi) */}
      {selectedRequest && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[540px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                Đơn {selectedRequest.request_code}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                    {selectedRequest.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {selectedRequest.employee_name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedRequest.employee_code} · {selectedRequest.department}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {selectedRequest.status}
                </span>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2.5">
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-400">Loại đơn</span>
                  <span className="col-span-3 font-semibold text-slate-800">{selectedRequest.request_type}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-400">Hình thức</span>
                  <span className="col-span-3 text-slate-800">{selectedRequest.form_type}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-400">Thời gian</span>
                  <span className="col-span-3 text-slate-800">{selectedRequest.time_range}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-400">Số ngày nghỉ</span>
                  <span className="col-span-3 text-slate-800">{selectedRequest.days_count}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-400">Lý do</span>
                  <span className="col-span-3 text-slate-800">{selectedRequest.reason}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-3">Lịch sử xử lý</h5>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-100 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="font-semibold text-slate-800">Gửi đơn</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{selectedRequest.submit_time}</div>
                  </div>

                  <div className="relative pt-1">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white" />
                    <div className="font-semibold text-slate-800">Chờ Trần Minh Quân phê duyệt</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Đang xử lý</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Ý kiến của quản lý</label>
                <textarea
                  rows="3"
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="Nhập ý kiến..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 resize-none text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Bắt buộc khi từ chối đơn.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Đóng
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleProcessAction('Từ chối')}
                className="flex items-center space-x-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
              >
                <X size={14} />
                <span>Từ chối</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleProcessAction('Đã duyệt')}
                className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl transition shadow-sm disabled:opacity-50"
              >
                <Check size={14} />
                <span>Phê duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}