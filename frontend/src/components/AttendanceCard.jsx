import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function AttendanceCard({ user }) {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    try {
      const res = await api.get('/timesheets/today', {
        params: { employeeCode: user?.employeeCode || 'NV002' }
      });
      setTodayData(res.data);
    } catch (err) {
      console.warn('Lỗi lấy trạng thái điểm danh:', err.message);
    }
  };

  useEffect(() => {
    fetchToday();
  }, [user]);

  const handleAction = async () => {
    setLoading(true);
    try {
      const res = await api.post('/timesheets/checkin', {
        employeeCode: user?.employeeCode || 'NV002'
      });
      alert(res.data.message);
      await fetchToday();
    } catch (err) {
      alert('Lỗi điểm danh: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const hasIn = Boolean(todayData?.time_in);
  const hasOut = Boolean(todayData?.time_out);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
      <div>
        <h4 className="font-bold text-slate-800 text-sm">Chấm công hôm nay</h4>
        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
          <span>Giờ vào: <strong className="text-slate-700">{todayData?.time_in || '--:--'}</strong></span>
          <span>•</span>
          <span>Giờ ra: <strong className="text-slate-700">{todayData?.time_out || '--:--'}</strong></span>
        </div>
      </div>

      <div>
        {hasIn && hasOut ? (
          <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <CheckCircle2 size={16} />
            <span>Đã hoàn thành ca</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleAction}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer text-white ${
              !hasIn
                ? 'bg-[#b9000b] hover:bg-[#a0000a]'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {!hasIn ? <LogIn size={15} /> : <LogOut size={15} />}
            <span>
              {loading
                ? 'Đang xử lý...'
                : !hasIn
                ? 'Điểm danh vào ca'
                : 'Điểm danh tan ca'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}