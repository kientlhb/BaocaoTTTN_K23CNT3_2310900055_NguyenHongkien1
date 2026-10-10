import React from 'react';
import { Clock, Plus, Info } from 'lucide-react';

export default function MyProfilePage({ user, onOpenModal }) {
  const profile = {
    fullName: user?.fullName || 'Nguyễn Thu Hà',
    role: 'Kỹ sư phần mềm',
    dept: user?.department || 'Phòng Kỹ thuật',
    code: user?.employeeCode || 'NV002',
    email: user?.username || 'ha.nt@congty.vn',
    phone: '0987 654 321',
    birthday: '20/08/1995',
    joinDate: '14/06/2021',
    manager: 'Trần Minh Quân',
    leaveRemain: '8/12 ngày'
  };

  return (
    <div className="space-y-6">
      {/* Header Action: Nút sáng rõ, bấm mở modal bình thường */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">Hồ sơ cá nhân</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
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

      <div className="grid grid-cols-3 gap-6 items-start">
        <div className="col-span-1 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 font-bold text-lg flex items-center justify-center">
            NH
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{profile.fullName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{profile.role}</p>
            <p className="text-xs text-slate-400">{profile.dept}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đang làm việc
          </span>
        </div>

        <div className="col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-base">Thông tin nhân viên</h3>

          <div className="grid grid-cols-4 gap-y-6 gap-x-4 text-xs">
            <div>
              <div className="text-slate-400 mb-1">Mã nhân viên</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.code}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Email</div>
              <div className="font-semibold text-slate-800 text-sm truncate">{profile.email}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Số điện thoại</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.phone}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Ngày sinh</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.birthday}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Phòng ban</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.dept}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Ngày vào làm</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.joinDate}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Quản lý trực tiếp</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.manager}</div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">Phép năm còn lại</div>
              <div className="font-semibold text-slate-800 text-sm">{profile.leaveRemain}</div>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-center space-x-2.5 text-xs text-blue-700">
            <Info size={16} className="text-blue-600 flex-shrink-0" />
            <span>Thông tin hồ sơ do Phòng Nhân sự quản lý. Liên hệ quản lý trực tiếp nếu cần cập nhật.</span>
          </div>
        </div>
      </div>
    </div>
  );
}