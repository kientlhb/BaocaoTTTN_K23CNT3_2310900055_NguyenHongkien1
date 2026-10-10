import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function ImportTimesheetModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) {
      alert('Vui lòng chọn file Excel hoặc CSV!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/timesheets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Lỗi import: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 text-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[500px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="text-emerald-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Nhập dữ liệu máy chấm công</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/20 rounded-2xl p-6 text-center cursor-pointer transition"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                setFile(e.target.files[0]);
                setResult(null);
              }}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <UploadCloud className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="font-semibold text-slate-700">
              {file ? file.name : 'Bấm để tải file Excel chấm công (.xlsx, .csv)'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600">
            <span className="font-semibold block mb-1">Cột bắt buộc trong Excel:</span>
            <code className="text-red-600 font-mono">Mã NV | Ngày | Giờ vào | Giờ ra | Trạng thái</code>
          </div>

          {result && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                <CheckCircle2 size={16} />
                <span>{result.message}</span>
              </div>
              {result.errors?.length > 0 && (
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-700 text-[11px] max-h-24 overflow-y-auto">
                  <p className="font-semibold flex items-center gap-1 mb-1">
                    <AlertCircle size={13} /> Dòng bị bỏ qua:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.errors.map((e, idx) => <li key={idx}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!file || uploading}
            onClick={handleUpload}
            className="px-5 py-2 font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl shadow-sm disabled:opacity-50"
          >
            {uploading ? 'Đang nạp...' : 'Bắt đầu nạp'}
          </button>
        </div>
      </div>
    </div>
  );
}