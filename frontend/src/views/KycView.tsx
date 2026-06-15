import type { Dispatch, SetStateAction, FormEvent } from 'react';

import { CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import type { User } from '../types';

interface Props {
  currentUser: User;
  kycForm: { name: string; idNumber: string; documentUrl: string };
  setKycForm: Dispatch<SetStateAction<{ name: string; idNumber: string; documentUrl: string }>>;
  handleSubmitKYC: (e: FormEvent) => void;
}

export default function KycView({
  currentUser,
  kycForm,
  setKycForm,
  handleSubmitKYC
}: Props) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-[700px] mx-auto glass-panel rounded-xl p-6 border border-white/5 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">Xác Thực Danh Tính (KYC)</h2>
          <p className="text-xs text-slate-400">Vui lòng hoàn tất xác thực danh tính để kích hoạt tài khoản giao dịch đầy đủ.</p>
        </div>

        {currentUser.kycStatus === 'verified' && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-5 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-success mx-auto" />
            <h3 className="text-sm font-bold text-success">Yêu Cầu KYC Của Sếp Đã Được Duyệt!</h3>
            <p className="text-xs text-white/80">Tài khoản đã kích hoạt tất cả quyền hạn giao dịch tối cao.</p>
          </div>
        )}

        {currentUser.kycStatus === 'pending' && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-5 text-center space-y-2">
            <Clock className="w-10 h-10 text-primary mx-auto animate-spin" />
            <h3 className="text-sm font-bold text-primary">Đang Chờ Admin Phê Duyệt</h3>
            <p className="text-xs text-white/80">Hồ sơ đã gửi thành công. Sếp có thể tự phê duyệt hồ sơ trong mục Admin Operations nha desu~!</p>
          </div>
        )}

        {currentUser.kycStatus === 'unverified' && (
          <form onSubmit={handleSubmitKYC} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase">Họ và Tên</label>
                <input 
                  type="text" 
                  value={kycForm.name} 
                  onChange={(e) => setKycForm(prev => ({ ...prev, name: e.target.value }))} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary text-xs" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase">Số CCCD / Hộ Chiếu</label>
                <input 
                  type="text" 
                  value={kycForm.idNumber} 
                  onChange={(e) => setKycForm(prev => ({ ...prev, idNumber: e.target.value }))} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary text-xs" 
                  placeholder="0352XXXXXXXX" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase">Ảnh Mặt Trước CCCD (Đường Dẫn)</label>
              <input 
                type="text" 
                value={kycForm.documentUrl} 
                onChange={(e) => setKycForm(prev => ({ ...prev, documentUrl: e.target.value }))} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary text-xs" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-primary hover:opacity-90 text-bg font-bold font-display py-2.5 rounded-lg transition-all">
              GỬI HỒ SƠ XÁC THỰC
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
