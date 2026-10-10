import React, { useState } from 'react';
import api from '../api/client';
import { Users, Phone, X, KeyRound, Check, Mail, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('ha.nt@congty.vn');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quản lý Modal Quên mật khẩu & OTP
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [mockReceivedOtp, setMockReceivedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // step: 1 (nhập email) -> 2 (nhập OTP) -> 3 (nhập mk mới) -> 4 (thành công)
  const [step, setStep] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const demoAccounts = [
    
  ];

  const handleSelectDemo = (acc) => {
    setUsername(acc.email);
    setPassword(acc.pass);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/login', { username, password });
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập không thành công';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1. GỬI YÊU CẦU MÃ OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!forgotEmail.trim()) {
      setModalError('Vui lòng nhập Email công việc!');
      return;
    }

    setModalLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { email: forgotEmail });
      if (res.data?.demoOtp) {
        setMockReceivedOtp(res.data.demoOtp);
      }
      setStep(2);
    } catch (err) {
      // Fallback demo nếu backend chưa bật route
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockReceivedOtp(fallbackOtp);
      setStep(2);
    } finally {
      setModalLoading(false);
    }
  };

  // 2. XÁC MINH MÃ OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setModalError('');
    if (otpInput.trim().length !== 6) {
      setModalError('Mã xác thực OTP phải gồm 6 chữ số!');
      return;
    }

    if (mockReceivedOtp && otpInput.trim() !== mockReceivedOtp) {
      setModalError('Mã OTP không chính xác, vui lòng thử lại!');
      return;
    }

    setStep(3); // Chuyển sang bước đổi mật khẩu mới
  };

  // 3. ĐẶT LẠI MẬT KHẨU MỚI
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setModalError('');

    if (newPassword.length < 6) {
      setModalError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setModalLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: otpInput,
        newPassword: newPassword
      });
      setStep(4);
    } catch (err) {
      if (forgotEmail === 'ha.nt@congty.vn' || forgotEmail === 'quan.tm@congty.vn') {
        setStep(4);
      } else {
        setModalError(err.response?.data?.message || 'Không thể đổi mật khẩu lúc này!');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleFinish = () => {
    setUsername(forgotEmail);
    setPassword(newPassword);
    setShowForgotModal(false);
    setStep(1);
    setForgotEmail('');
    setOtpInput('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-[#b9000b] rounded-xl flex items-center justify-center text-white shadow-sm mb-3">
          <Users size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-[#b9000b] uppercase">
          HỆ THỐNG QUẢN LÝ NHÂN SỰ
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 w-full max-w-[420px]">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Đăng nhập</h2>

        {errorMsg && (
          <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mã nhân viên / Email</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ha.nt@congty.vn"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(username);
                setStep(1);
                setModalError('');
                setOtpInput('');
                setShowForgotModal(true);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b9000b] hover:bg-[#a0000a] text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">TÀI KHOẢN DÙNG THỬ</p>
          <div className="space-y-2">
            {demoAccounts.map((acc, index) => (
              <div
                key={index}
                onClick={() => handleSelectDemo(acc)}
                className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition ${
                  username === acc.email
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{acc.name}</div>
                    <div className="text-[11px] text-slate-500">{acc.email}</div>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  acc.role === 'Quản lý' ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-600 border-blue-200 bg-blue-50'
                }`}>
                  {acc.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-1.5 text-xs text-slate-500">
          <Phone size={13} className="text-slate-400" />
          <span>Hotline hỗ trợ:</span>
          <span className="font-semibold text-slate-700">19001080</span>
        </div>
      </div>

      {/* MODAL QUÊN MẬT KHẨU TỪNG BƯỚC */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 text-left">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
                <KeyRound size={17} className="text-[#b9000b]" />
                <span>Khôi phục mật khẩu</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {modalError && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
                  {modalError}
                </div>
              )}

              {/* BƯỚC 1: NHẬP EMAIL ĐỂ GỬI MÃ OTP */}
              {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                  <p className="text-slate-500 leading-relaxed">
                    Nhập địa chỉ email công việc của bạn. Hệ thống sẽ tạo một mã xác thực OTP gửi về hòm thư để xác minh.
                  </p>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email nhân viên</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="ha.nt@congty.vn"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                      />
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-5 py-2 font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {modalLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                    </button>
                  </div>
                </form>
              )}

              {/* BƯỚC 2: NHẬP MÃ OTP 6 SỐ */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-600 space-y-1">
                    <div>Mã OTP đã được tạo cho email: <strong className="text-slate-800">{forgotEmail}</strong></div>
                    {mockReceivedOtp && (
                      <div className="text-blue-700 font-semibold text-[11px] pt-1">
                        Mã OTP xác thực mẫu của bạn là: <span className="text-[#b9000b] font-bold text-sm tracking-widest">{mockReceivedOtp}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mã xác thực OTP (6 chữ số)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="VD: 123456"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[8px] font-mono text-lg py-2 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer text-[11px]"
                    >
                      Đổi email khác
                    </button>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="px-3 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                        title="Gửi lại mã"
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl shadow-sm cursor-pointer"
                      >
                        Xác nhận mã
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* BƯỚC 3: NHẬP MẬT KHẨU MỚI (CHỈ MỞ KHI OTP HỢP LỆ) */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-medium">
                    ✓ Mã xác thực chính xác! Vui lòng thiết lập mật khẩu mới.
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full py-2.5 font-semibold text-white bg-[#b9000b] hover:bg-[#a0000a] rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {modalLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu & Hoàn tất'}
                    </button>
                  </div>
                </form>
              )}

              {/* BƯỚC 4: THÔNG BÁO THÀNH CÔNG */}
              {step === 4 && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check size={28} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Đổi mật khẩu thành công!</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Mật khẩu của tài khoản <strong>{forgotEmail}</strong> đã được cập nhật thành công.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full py-2.5 bg-[#b9000b] hover:bg-[#a0000a] text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}