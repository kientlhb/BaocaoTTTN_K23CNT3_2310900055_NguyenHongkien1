import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Users, FileText, CalendarCheck, Clock, Check, X, Eye, 
  Calendar as CalendarIcon, CheckCircle2, XCircle 
} from 'lucide-react';

export default function DashboardPage({ setTab }) {
  // Mặc định luôn là 'standard' (A · Tiêu chuẩn)
  const [layoutMode, setLayoutMode] = useState('standard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(11);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const reqRes = await api.get('/requests');
      if (Array.isArray(reqRes.data)) {
        setRequests(reqRes.data);
      }

      const empRes = await api.get('/employees');
      if (Array.isArray(empRes.data)) {
        setTotalEmployees(empRes.data.length);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (target, newStatus) => {
    const targetId = target.id || target.request_code;
    const approver = 'Trần Minh Quân (Quản lý)';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    try {
      await api.patch(`/requests/${targetId}/status`, {
        status: newStatus,
        approved_by: approver,
        approval_note: newStatus === 'Đã duyệt' ? 'Đã duyệt từ bảng hàng đợi' : 'Từ chối đơn'
      });

      setRequests(prev => prev.map(r => {
        if ((r.id && r.id === target.id) || r.request_code === target.request_code) {
          return { ...r, status: newStatus, approved_by: approver, approved_at: timeStr };
        }
        return r;
      }));

      if (selectedRequest && ((selectedRequest.id && selectedRequest.id === target.id) || selectedRequest.request_code === target.request_code)) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
      alert(`Đã chuyển trạng thái: ${newStatus}`);
    } catch (err) {
      console.warn('Cập nhật local state:', err.message);
      setRequests(prev => prev.map(r => {
        if ((r.id && r.id === target.id) || r.request_code === target.request_code) {
          return { ...r, status: newStatus };
        }
        return r;
      }));
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Chờ duyệt');

  const renderStatCards = (isVertical = false) => (
    <div className={isVertical ? "space-y-4" : "grid grid-cols-4 gap-5"}>
      <div 
        onClick={() => setTab('employees')} 
        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4 cursor-pointer hover:border-red-200 transition"
      >
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
          <Users size={20} />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium">Tổng nhân viên</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalEmployees}</div>
          <div className="text-[11px] text-slate-400 mt-1">1 đang thử việc</div>
        </div>
      </div>

      <div 
        onClick={() => setTab('requests')} 
        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4 cursor-pointer hover:border-red-200 transition"
      >
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
          <FileText size={20} />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium">Đơn chờ duyệt</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">{pendingRequests.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đang cần xử lý</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
          <CalendarCheck size={20} />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium">Vắng mặt hôm nay</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">2</div>
          <div className="text-[11px] text-slate-400 mt-1">9 người đi làm</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b9000b] flex items-center justify-center flex-shrink-0">
          <Clock size={20} />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium">Bổ sung công tháng 9</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">
            {requests.filter(r => (r.request_type || r.type) === 'Bổ sung công').length || 4}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tính cả đơn chờ duyệt</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">Tổng quan</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tổng quan</h2>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setLayoutMode('standard')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutMode === 'standard' ? 'bg-white text-red-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A · Tiêu chuẩn
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('queue')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutMode === 'queue' ? 'bg-white text-red-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            B · Hàng đợi
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('weekly')}
            className={`px-3 py-1.5 rounded-lg transition ${
              layoutMode === 'weekly' ? 'bg-white text-red-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            C · Theo tuần
          </button>
        </div>
      </div>

      {/* A · TIÊU CHUẨN (MẶC ĐỊNH) */}
      {layoutMode === 'standard' && (
        <div className="space-y-6">
          {renderStatCards(false)}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Đơn chờ duyệt</h3>
                <button onClick={() => setTab('requests')} className="text-xs text-red-600 font-semibold hover:underline">
                  Xem tất cả &rarr;
                </button>
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 pb-2">
                    <th className="py-2.5 font-medium">Nhân viên</th>
                    <th className="py-2.5 font-medium">Loại đơn</th>
                    <th className="py-2.5 font-medium">Thời gian</th>
                    <th className="py-2.5 font-medium">Ngày gửi</th>
                    <th className="py-2.5 font-medium text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 flex items-center space-x-2.5">
                        <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center">
                          {r.avatar || 'NV'}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">{r.employee_name || r.name}</div>
                          <div className="text-[10px] text-slate-400">{r.department || r.dept}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                          {r.request_type || r.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{r.time_range || r.time}</td>
                      <td className="py-3 text-slate-400">{r.submit_date || r.date}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-center space-x-2 text-slate-400">
                          <button onClick={() => handleAction(r, 'Đã duyệt')} title="Duyệt" className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check size={15} /></button>
                          <button onClick={() => handleAction(r, 'Từ chối')} title="Từ chối" className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={15} /></button>
                          <button onClick={() => setSelectedRequest(r)} title="Xem chi tiết" className="hover:text-slate-700 p-1 hover:bg-slate-100 rounded transition"><Eye size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm">Vắng mặt hôm nay</h3>
              <p className="text-[11px] text-slate-400 mb-4">Thứ Tư, 23/09/2026</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">PL</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Phạm Thị Lan</div>
                      <div className="text-[10px] text-slate-400">Phòng Nhân sự</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-50 text-blue-600 border border-blue-100">Phép năm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B · HÀNG ĐỢI */}
      {layoutMode === 'queue' && (
        <div className="grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-sm">Đơn cần xử lý</h3>
              <span className="w-5 h-5 bg-[#b9000b] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Đang nạp dữ liệu từ PostgreSQL...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs">
                Không còn đơn nào cần xử lý.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((r, i) => (
                  <div key={r.id || r.request_code || i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div className="flex items-start space-x-3.5">
                      <span className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {r.avatar || 'NV'}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm">{r.employee_name || r.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-50 text-blue-600 border border-blue-100">
                            {r.request_type || r.type}
                          </span>
                          <span className="text-[11px] text-slate-400">· {r.submit_date || r.date}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">{r.time_range || r.time}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{r.reason}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button 
                        onClick={() => setSelectedRequest(r)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                      >
                        Chi tiết
                      </button>
                      <button 
                        onClick={() => handleAction(r, 'Từ chối')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                      >
                        Từ chối
                      </button>
                      <button 
                        onClick={() => handleAction(r, 'Đã duyệt')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl transition shadow-sm"
                      >
                        Phê duyệt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-1">
            {renderStatCards(true)}
          </div>
        </div>
      )}

      {/* C · THEO TUẦN */}
      {layoutMode === 'weekly' && (
        <div className="space-y-6">
          {renderStatCards(false)}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Lịch vắng mặt tuần này</h3>
              <button onClick={() => setTab('calendar')} className="flex items-center space-x-1.5 text-xs text-[#b9000b] font-semibold hover:underline">
                <CalendarIcon size={14} />
                <span>Mở lịch tháng</span>
              </button>
            </div>
            <div className="grid grid-cols-7 border border-slate-200 rounded-xl divide-x divide-slate-200 text-xs overflow-hidden">
              <div className="min-h-[140px] p-2.5"><span className="font-semibold text-slate-600">T2 <strong>21/09</strong></span></div>
              <div className="min-h-[140px] p-2.5"><span className="font-semibold text-slate-600">T3 <strong>22/09</strong></span></div>
              <div className="min-h-[140px] p-2.5 bg-red-50/20">
                <span className="font-semibold text-[#b9000b]">T4 <strong>23/09</strong></span>
                <div className="space-y-1.5 mt-2">
                  <div className="text-[10px] text-amber-600 font-medium">VA · Nghỉ ốm</div>
                  <div className="text-[10px] text-blue-600 font-medium">PL · Phép năm</div>
                </div>
              </div>
              <div className="min-h-[140px] p-2.5"><span className="font-semibold text-slate-600">T5 <strong>24/09</strong></span></div>
              <div className="min-h-[140px] p-2.5"><span className="font-semibold text-slate-600">T6 <strong>25/09</strong></span></div>
              <div className="min-h-[140px] p-2.5 bg-slate-50/40"><span className="font-semibold text-slate-400">T7 26/09</span></div>
              <div className="min-h-[140px] p-2.5 bg-slate-50/40"><span className="font-semibold text-slate-400">CN 27/09</span></div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL CHI TIẾT ĐƠN */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Chi tiết đơn từ</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                    {selectedRequest.avatar || 'NV'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedRequest.employee_name || selectedRequest.name}</h4>
                    <p className="text-[11px] text-slate-400">{selectedRequest.department || selectedRequest.dept}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                  {selectedRequest.request_type || selectedRequest.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block mb-0.5">Mã đơn</span>
                  <span className="font-bold text-red-600">{selectedRequest.request_code || selectedRequest.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Ngày gửi</span>
                  <span className="text-slate-700">{selectedRequest.submit_date || selectedRequest.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">Thời gian đề xuất</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.time_range || selectedRequest.time}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">Lý do</span>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 italic">
                    "{selectedRequest.reason}"
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                {selectedRequest.status === 'Chờ duyệt' ? (
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleAction(selectedRequest, 'Từ chối')} className="px-3 py-1.5 bg-white border border-slate-200 text-red-600 rounded-lg font-semibold hover:bg-red-50">
                      Từ chối
                    </button>
                    <button onClick={() => handleAction(selectedRequest, 'Đã duyệt')} className="px-4 py-1.5 bg-[#b9000b] text-white rounded-lg font-semibold hover:bg-[#a0000a]">
                      Phê duyệt
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-600 font-medium">Trạng thái: <strong>{selectedRequest.status}</strong></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}