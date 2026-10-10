import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function PayrollPage({ user }) {
  const [month, setMonth] = useState('2026-09');
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Nhận diện tài khoản có quyền quản trị / HR
  const role = (user?.role || user?.system_role || '').toLowerCase();
  const isPrivileged = 
    role === 'hr' || 
    role === 'admin' || 
    role === 'manager' || 
    role === 'dr' || 
    role === 'quản lý' ||
    user?.username === 'admin' ||
    user?.username === 'quan.tm@congty.vn' ||
    user?.department?.toLowerCase().includes('nhân sự');

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      // Chỉ gửi employeeCode nếu là nhân viên thường để lấy phiếu lương cá nhân.
      // Với HR / Quản lý / Admin thì không gửi để Backend trả về toàn bộ nhân viên.
      const params = { month };
      if (!isPrivileged) {
        params.employeeCode = user?.employee_code || user?.employeeCode || 'NV002';
      }

      const res = await api.get('/payrolls', { params });
      setPayrolls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu bảng lương:', err);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, [month, isPrivileged, user]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleCalculatePayroll = async () => {
    setCalculating(true);
    try {
      const res = await api.post('/payrolls/generate', { month });
      alert(res.data.message || 'Đã tính toán bảng lương thành công!');
      await fetchPayrolls();
    } catch (err) {
      alert('Lỗi tính lương: ' + (err.response?.data?.message || err.message));
    } finally {
      setCalculating(false);
    }
  };

  const formatVND = (value) => Number(value || 0).toLocaleString('vi-VN') + ' đ';
  const myPayroll = payrolls[0] || null;

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Chọn tháng */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Trang chủ &gt; {isPrivileged ? 'Bảng lương nhân sự' : 'Phiếu lương cá nhân'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isPrivileged ? 'Bảng tính lương nhân viên' : `Phiếu lương tháng ${month}`}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm">
            <Calendar size={15} className="text-slate-400" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="outline-none text-slate-700 bg-transparent cursor-pointer font-medium"
            />
          </div>

          {/* Nút chỉ dành cho cấp Quản lý / HR */}
          {isPrivileged && (
            <button
              type="button"
              disabled={calculating}
              onClick={handleCalculatePayroll}
              className="flex items-center space-x-2 bg-[#b9000b] hover:bg-[#a0000a] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={calculating ? 'animate-spin' : ''} />
              <span>{calculating ? 'Đang tính từ DB...' : 'Tính lại bảng lương'}</span>
            </button>
          )}
        </div>
      </div>

      {/* GIAO DIỆN 1: DÀNH CHO NHÂN VIÊN THƯỜNG (PHIẾU LƯƠNG CÁ NHÂN) */}
      {!isPrivileged ? (
        loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Đang tải dữ liệu phiếu lương...
          </div>
        ) : !myPayroll ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Chưa có dữ liệu bảng lương tháng <strong>{month}</strong> của bạn. Vui lòng liên hệ phòng Nhân sự!
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 font-medium">Lương cơ bản</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{formatVND(myPayroll.base_salary)}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Ngày công: {myPayroll.working_days} / 22</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 font-medium">Phụ cấp</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">+{formatVND(myPayroll.allowance)}</p>
                <span className="text-[11px] text-emerald-500 mt-1 block">Theo chế độ chức vụ</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400 font-medium">Khấu trừ (Đi muộn / Phạt)</span>
                <p className="text-xl font-bold text-rose-500 mt-1">-{formatVND(myPayroll.deduction)}</p>
                <span className="text-[11px] text-rose-400 mt-1 block">Khấu trừ thực tế</span>
              </div>

              <div className="bg-red-50/70 p-5 rounded-2xl border border-red-100 shadow-sm">
                <span className="text-xs text-red-600 font-bold uppercase tracking-wider">Thực nhận</span>
                <p className="text-2xl font-extrabold text-[#b9000b] mt-1">{formatVND(myPayroll.net_salary)}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                  <CheckCircle2 size={13} /> {myPayroll.status || 'Chờ thanh toán'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Chi tiết thu nhập cá nhân
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Mã nhân viên:</span>
                  <span className="font-bold text-slate-800">{myPayroll.employee_code}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-semibold text-slate-800">{myPayroll.full_name}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Phòng ban:</span>
                  <span className="font-medium text-slate-700">{myPayroll.department}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Vai trò:</span>
                  <span className="font-semibold text-blue-600 uppercase">{myPayroll.role}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Lương tính theo ngày công thực tế:</span>
                  <span className="font-medium text-slate-800">
                    {formatVND((Number(myPayroll.base_salary) / 22) * Number(myPayroll.working_days))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        /* GIAO DIỆN 2: DÀNH CHO HR / QUẢN LÝ / ADMIN (BẢNG LƯƠNG TOÀN CÔNG TY) */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="py-3 px-3">Mã NV</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Phòng ban</th>
                <th className="py-3 px-3">Vai trò</th>
                <th className="py-3 px-3 text-right">Lương cơ bản</th>
                <th className="py-3 px-3 text-center">Ngày công</th>
                <th className="py-3 px-3 text-right">Phụ cấp</th>
                <th className="py-3 px-3 text-right">Khấu trừ</th>
                <th className="py-3 px-3 text-right">Thực nhận</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                    Đang truy vấn bảng lương từ database...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    Chưa có dữ liệu bảng lương tháng <strong>{month}</strong>. Hãy bấm{' '}
                    <span className="text-[#b9000b] font-semibold">"Tính lại bảng lương"</span>!
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => {
                  const roleName = (p.role || '').toLowerCase();
                  return (
                    <tr key={p.id || p.employee_code} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-red-600">{p.employee_code}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{p.full_name}</td>
                      <td className="py-3.5 px-3 text-slate-500">{p.department || '---'}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            roleName === 'dr'
                              ? 'bg-purple-100 text-purple-700'
                              : roleName === 'manager' || roleName.includes('quản lý')
                              ? 'bg-blue-100 text-blue-700'
                              : roleName === 'hr'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.role || 'Nhân viên'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium">{formatVND(p.base_salary)}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                        {p.working_days} / 22
                      </td>
                      <td className="py-3.5 px-3 text-right text-emerald-600">
                        +{formatVND(p.allowance)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-rose-500">
                        -{formatVND(p.deduction)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#b9000b] text-sm">
                        {formatVND(p.net_salary)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status || 'Chờ thanh toán'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}