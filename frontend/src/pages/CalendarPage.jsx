import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Tiêu đề */}
      <div>
        <div className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
          <span>Trang chủ</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-medium">Lịch nghỉ</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Lịch nghỉ</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        {/* Điều hướng tháng & Chú thích */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-base font-bold text-slate-800">Tháng 9/2026</h3>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Đã duyệt
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Chờ duyệt
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Ngày lễ
            </span>
          </div>
        </div>

        {/* Lưới lịch */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Thứ trong tuần */}
          <div className="grid grid-cols-7 bg-slate-50/70 border-b border-slate-200 text-center py-2 text-xs font-semibold text-slate-600">
            {days.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Các ô ngày */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 text-xs">
            {/* Hàng 1 */}
            <div className="h-28 p-2 text-slate-400 bg-slate-50/30">31</div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">1</span>
              <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-[10px] text-center py-1 rounded-md font-medium">Nghỉ lễ</div>
            </div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">2</span>
              <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-[10px] text-center py-1 rounded-md font-medium">Quốc khánh</div>
            </div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">3</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">4</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">5</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">6</span></div>

            {/* Hàng 2 */}
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">7</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">8</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">9</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">10</span></div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">11</span>
              <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-1 rounded-md font-medium">Thu Hà</div>
            </div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">12</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">13</span></div>

            {/* Hàng 3 */}
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">14</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">15</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">16</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">17</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">18</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">19</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">20</span></div>

            {/* Hàng 4 */}
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">21</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">22</span></div>
            <div className="h-28 p-2 bg-red-50/20">
              <span className="w-5 h-5 bg-[#b9000b] text-white rounded-full flex items-center justify-center font-bold text-[11px]">23</span>
              <div className="space-y-1 mt-1">
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] text-center py-0.5 rounded">Ngọc Anh</div>
                <div className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-0.5 rounded">Thị Lan</div>
                <div className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-0.5 rounded">Văn Hùng (½)</div>
              </div>
            </div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">24</span>
              <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-1 rounded-md font-medium">Thị Lan</div>
            </div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">25</span>
              <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] text-center py-1 rounded-md font-medium">Thu Hà</div>
            </div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">26</span></div>
            <div className="h-28 p-2"><span className="font-semibold text-slate-700">27</span></div>

            {/* Hàng 5 */}
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">28</span>
              <div className="space-y-1 mt-1">
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] text-center py-0.5 rounded">Thu Hà</div>
                <div className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-0.5 rounded">Thị Hương</div>
              </div>
            </div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">29</span>
              <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-1 rounded-md font-medium">Thị Hương</div>
            </div>
            <div className="h-28 p-2">
              <span className="font-semibold text-slate-700">30</span>
              <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] text-center py-1 rounded-md font-medium">Thị Hương</div>
            </div>
            <div className="h-28 p-2 text-slate-400 bg-slate-50/30">1</div>
            <div className="h-28 p-2 text-slate-400 bg-slate-50/30">2</div>
            <div className="h-28 p-2 text-slate-400 bg-slate-50/30">3</div>
            <div className="h-28 p-2 text-slate-400 bg-slate-50/30">4</div>
          </div>
        </div>
      </div>
    </div>
  );
}