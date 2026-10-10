import React, { useState } from 'react';
import { Eye, Clock, Plus, X } from 'lucide-react';

export default function MyRequestsPage({ user, onOpenModal }) {
  const [filterTab, setFilterTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReq, setSelectedReq] = useState(null);

  const [requests] = useState([
    {
      code: 'DT-0142',
      type: 'Phép năm',
      time: '25/09 – 28/09/2026 · 2 ngày',
      reason: 'Việc gia đình ở quê',
      submitDate: '09:14 · 22/09/2026',
      status: 'Chờ duyệt'
    },
    {
      code: 'DT-0137',
      type: 'Bổ sung công',
      time: '15/09/2026 · 08:10 – 17:35',
      reason: 'Quên quẹt thẻ chấm công ra về',
      submitDate: '17:40 · 15/09/2026',
      status: 'Đã duyệt'
    },
    {
      code: 'DT-0134',
      type: 'Phép năm',
      time: '11/09/2026 · 1 ngày',
      reason: 'Nghỉ giải quyết việc cá nhân',
      submitDate: '08:30 · 10/09/2026',
      status: 'Đã duyệt'
    }
  ]);

  const countPending = requests.filter(r => r.status === 'Chờ duyệt').length;
  const countApproved = requests.filter(r => r.status === 'Đã duyệt').length;
  const countTotal = requests.length;

  const filtered = requests.filter(item => {
    const matchStatus =
      filterTab === 'all' ? true :
      filterTab === 'pending' ? item.status === 'Chờ duyệt' :
      filterTab === 'approved' ? item.status === 'Đã duyệt' :
      filterTab === 'rejected' ? item.status === 'Từ chối' :
      filterTab === 'cancelled' ? item.status === 'Đã hủy' : true;

    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header Action: Nút sáng rõ, bấm mở modal bình thường */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">Đơn của tôi</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Đơn của tôi</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onOpenModal && onOpenModal('timesheet')}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
          >
            <Clock size={15} className="text-slate-500" />
            <span>Đơn bổ sung công</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal && onOpenModal('leave')}
            className="flex items-center space-x-2 bg-[#b9000b] hover:bg-[#a0000a] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Đơn nghỉ phép</span>
          </button>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterTab === 'pending' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Chờ duyệt</span>
            <span className="bg-[#b9000b] text-white px-1.5 py-0.2 rounded-full text-[10px]">{countPending}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('approved')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterTab === 'approved' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Đã duyệt</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{countApproved}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('rejected')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterTab === 'rejected' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Từ chối
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterTab === 'cancelled' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đã hủy
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterTab === 'all' ? 'bg-red-50 text-[#b9000b]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Tất cả</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">{countTotal}</span>
          </button>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 bg-white focus:outline-none"
          >
            <option value="all">Tất cả loại đơn</option>
            <option value="Phép năm">Phép năm</option>
            <option value="Bổ sung công">Bổ sung công</option>
            <option value="Nghỉ ốm">Nghỉ ốm</option>
          </select>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-3 font-medium">Mã đơn</th>
              <th className="py-3 font-medium">Loại đơn</th>
              <th className="py-3 font-medium">Thời gian</th>
              <th className="py-3 font-medium">Lý do</th>
              <th className="py-3 font-medium">Ngày gửi ↑↓</th>
              <th className="py-3 font-medium">Trạng thái</th>
              <th className="py-3 font-medium text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item, index) => {
              const isPending = item.status === 'Chờ duyệt';
              return (
                <tr key={index} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 font-bold text-red-600">{item.code}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-700">{item.time}</td>
                  <td className="py-3.5 text-slate-500 max-w-[200px] truncate">{item.reason}</td>
                  <td className="py-3.5 text-slate-400">{item.submitDate}</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        isPending
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedReq(item)}
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
      </div>

      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[480px] p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Chi tiết đơn {selectedReq.code}</h3>
              <button type="button" onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong className="text-slate-600">Loại đơn:</strong> {selectedReq.type}</p>
              <p><strong className="text-slate-600">Thời gian:</strong> {selectedReq.time}</p>
              <p><strong className="text-slate-600">Lý do:</strong> {selectedReq.reason}</p>
              <p><strong className="text-slate-600">Ngày gửi:</strong> {selectedReq.submitDate}</p>
              <p><strong className="text-slate-600">Trạng thái:</strong> {selectedReq.status}</p>
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