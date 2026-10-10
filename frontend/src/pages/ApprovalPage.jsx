import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Check, X, Eye, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ApprovalPage() {
  const [filterTab, setFilterTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null); // Quản lý modal chi tiết

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải đơn:', err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
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
        approval_note: newStatus === 'Đã duyệt' ? 'Đã duyệt qua hệ thống' : 'Từ chối đơn'
      });
    } catch (err) {
      console.warn('Cập nhật local:', err.message);
    }

    setRequests(prev => prev.map(item => {
      if ((item.id && item.id === target.id) || item.request_code === target.request_code) {
        return {
          ...item,
          status: newStatus,
          approved_by: approver,
          approved_at: timeStr,
          approval_note: newStatus === 'Đã duyệt' ? 'Đã duyệt qua hệ thống' : 'Từ chối đơn'
        };
      }
      return item;
    }));

    if (selectedRequest && ((selectedRequest.id && selectedRequest.id === target.id) || selectedRequest.request_code === target.request_code)) {
      setSelectedRequest(prev => ({
        ...prev,
        status: newStatus,
        approved_by: approver,
        approved_at: timeStr
      }));
    }
  };

  const countPending = requests.filter(r => r.status === 'Chờ duyệt').length;
  const countApproved = requests.filter(r => r.status === 'Đã duyệt').length;
  const countRejected = requests.filter(r => r.status === 'Từ chối').length;
  const countTotal = requests.length;

  const filtered = requests.filter(item => {
    const matchStatus =
      filterTab === 'all' ? true :
      filterTab === 'pending' ? item.status === 'Chờ duyệt' :
      filterTab === 'approved' ? item.status === 'Đã duyệt' :
      filterTab === 'rejected' ? item.status === 'Từ chối' :
      filterTab === 'cancelled' ? item.status === 'Đã hủy' : true;

    const currentType = item.request_type || item.type;
    const matchType = typeFilter === 'all' || currentType === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
          <span>Trang chủ</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-medium">Duyệt đơn</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Duyệt đơn</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        {/* Tab trạng thái */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setFilterTab('pending')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'pending' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Chờ duyệt</span>
            <span className="bg-[#b9000b] text-white px-1.5 py-0.2 rounded-full text-[10px]">{countPending}</span>
          </button>
          
          <button
            onClick={() => setFilterTab('approved')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'approved' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Đã duyệt</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{countApproved}</span>
          </button>

          <button
            onClick={() => setFilterTab('rejected')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'rejected' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Từ chối</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{countRejected}</span>
          </button>

          <button
            onClick={() => setFilterTab('cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'cancelled' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đã hủy
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'all' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Tất cả</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{countTotal}</span>
          </button>
        </div>

        {/* Lọc loại đơn */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 bg-white focus:outline-none"
          >
            <option value="all">Tất cả loại đơn</option>
            <option value="Phép năm">Phép năm</option>
            <option value="Bổ sung công">Bổ sung công</option>
            <option value="Nghỉ ốm">Nghỉ ốm</option>
          </select>
        </div>

        {/* Bảng danh sách */}
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-3 font-medium">Mã đơn</th>
              <th className="py-3 font-medium">Nhân viên ↑↓</th>
              <th className="py-3 font-medium">Loại đơn</th>
              <th className="py-3 font-medium">Thời gian</th>
              <th className="py-3 font-medium">Lý do</th>
              <th className="py-3 font-medium">Ngày gửi ↑↓</th>
              <th className="py-3 font-medium">Trạng thái</th>
              <th className="py-3 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item, index) => {
              const isPending = item.status === 'Chờ duyệt';
              const isApproved = item.status === 'Đã duyệt';
              const isRejected = item.status === 'Từ chối';

              return (
                <tr key={index} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 font-bold text-red-600">{item.request_code || item.id}</td>
                  <td className="py-3.5 flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center">
                      {item.avatar || 'NV'}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{item.employee_name || item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.department || item.dept}</div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      {item.request_type || item.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-700">{item.time_range || item.time}</td>
                  <td className="py-3.5 text-slate-500 max-w-[200px] truncate">{item.reason}</td>
                  <td className="py-3.5 text-slate-400">{item.submit_date || item.date}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      isRejected ? 'bg-red-50 text-red-600 border border-red-200' :
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isApproved ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center space-x-2 text-slate-400">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleAction(item, 'Đã duyệt')}
                            title="Duyệt đơn"
                            className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(item, 'Từ chối')}
                            title="Từ chối đơn"
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setSelectedRequest(item)}
                        title="Xem chi tiết đơn" 
                        className="hover:text-slate-700 p-1 hover:bg-slate-100 rounded transition"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL CHI TIẾT ĐƠN */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText size={18} className="text-[#b9000b]" />
                <h3 className="font-bold text-slate-800 text-base">Chi tiết đơn từ</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Nhân viên tạo đơn */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center">
                    {selectedRequest.avatar || 'NV'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedRequest.employee_name || selectedRequest.name}</h4>
                    <p className="text-xs text-slate-400">{selectedRequest.department || selectedRequest.dept}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                  {selectedRequest.request_type || selectedRequest.type}
                </span>
              </div>

              {/* Thông tin đơn */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Mã đơn</span>
                  <span className="font-bold text-red-600 text-sm">{selectedRequest.request_code || selectedRequest.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Thời gian gửi</span>
                  <span className="font-medium text-slate-700 text-xs">{selectedRequest.submit_date || selectedRequest.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">Khoảng thời gian nghỉ/chấm công</span>
                  <span className="font-semibold text-slate-800 text-xs">{selectedRequest.time_range || selectedRequest.time}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">Lý do xin đơn</span>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 text-xs italic">
                    "{selectedRequest.reason || 'Không có lý do chi tiết'}"
                  </div>
                </div>
              </div>

              {/* KHỐI TRẠNG THÁI VÀ THÔNG TIN NGƯỜI DUYỆT */}
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-800 mb-2">Trạng thái phê duyệt</div>
                
                {selectedRequest.status === 'Đã duyệt' && (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>ĐÃ ĐƯỢC PHÊ DUYỆT</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Người duyệt: <strong className="text-slate-800">{selectedRequest.approved_by || 'Trần Minh Quân (Quản lý)'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Thời gian: {selectedRequest.approved_at || '10:00 · 23/09/2026'}
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'Từ chối' && (
                  <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center space-x-2 text-red-600 font-bold text-xs">
                      <XCircle size={16} />
                      <span>ĐƠN BỊ TỪ CHỐI</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Người từ chối: <strong className="text-slate-800">{selectedRequest.approved_by || 'Trần Minh Quân (Quản lý)'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Thời gian: {selectedRequest.approved_at || '10:00 · 23/09/2026'}
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'Chờ duyệt' && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-700 font-semibold text-xs">
                      <Clock size={16} />
                      <span>Đơn đang trong hàng đợi chờ duyệt</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(selectedRequest, 'Đã duyệt')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Duyệt ngay
                      </button>
                      <button
                        onClick={() => handleAction(selectedRequest, 'Từ chối')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-3 bg-slate-50/50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
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