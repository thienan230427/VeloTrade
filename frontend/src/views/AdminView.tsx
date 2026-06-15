
import type { Dispatch, SetStateAction } from 'react';
import { Settings, ShieldCheck, HelpCircle } from 'lucide-react';
import type { User, Ticket } from '../types';

interface Props {
  currentUser: User;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  kycForm: { name: string; idNumber: string; documentUrl: string };
  setKycForm: Dispatch<SetStateAction<{ name: string; idNumber: string; documentUrl: string }>>;
  ticketsList: Ticket[];
  handleResolveTicket: (id: string) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: Dispatch<SetStateAction<boolean>>;
  tradingFeeReduction: number;
  setTradingFeeReduction: Dispatch<SetStateAction<number>>;
  spawnToast: (title: string, msg: string, type?: 'success' | 'error') => void;
}

export default function AdminView({
  currentUser,
  setCurrentUser,
  kycForm,
  setKycForm,
  ticketsList,
  handleResolveTicket,
  maintenanceMode,
  setMaintenanceMode,
  tradingFeeReduction,
  setTradingFeeReduction,
  spawnToast
}: Props) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-lg font-bold font-display text-white">VeloTrade Admin Management Operations</h2>
          <p className="text-xs text-slate-400 mt-0.5">Bảng điều khiển tối cao dành riêng cho Quản trị viên (Admin) để giám sát và duyệt hệ thống.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-primary" /> Cấu Hình Hệ Thống
            </h3>
            <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-4 font-mono text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Chế độ bảo trì:</span>
                  <button 
                    onClick={() => setMaintenanceMode(prev => !prev)} 
                    className={`px-2.5 py-1 rounded transition-all text-[11px] font-bold ${
                      maintenanceMode ? 'bg-danger/25 border border-danger text-danger' : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}
                  >
                    {maintenanceMode ? 'BẬT' : 'TẮT'}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giảm phí giao dịch (%):</span>
                  <input 
                    type="number" 
                    value={tradingFeeReduction} 
                    onChange={(e) => setTradingFeeReduction(parseFloat(e.target.value) || 0)} 
                    className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white w-16 text-center focus:outline-none" 
                  />
                </div>
              </div>
              <button 
                onClick={() => spawnToast('Lưu cấu hình', 'Đã cập nhật cấu hình hệ thống thành công!', 'success')} 
                className="w-full bg-primary hover:opacity-90 text-bg font-bold font-display py-2 rounded-lg text-xs transition-all"
              >
                LƯU CẤU HÌNH
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Đang chờ duyệt KYC (Pending KYC)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface/30">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase">
                      <th className="px-4 py-2.5">User</th>
                      <th className="px-4 py-2.5">CCCD/ID</th>
                      <th className="px-4 py-2.5">Hồ Sơ</th>
                      <th className="px-4 py-2.5 text-right">Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentUser.kycStatus !== 'pending' ? (
                      <tr><td colSpan={4} className="text-center py-4 text-slate-500">Không có yêu cầu duyệt danh tính nào.</td></tr>
                    ) : (
                      <tr className="hover:bg-white/5 transition-all">
                        <td className="px-4 py-2.5 text-white font-bold">{kycForm.name}</td>
                        <td className="px-4 py-2.5">{kycForm.idNumber}</td>
                        <td className="px-4 py-2.5 text-primary hover:underline cursor-pointer">
                          <a href={kycForm.documentUrl} target="_blank" rel="noreferrer">Xem ảnh CCCD</a>
                        </td>
                        <td className="px-4 py-2.5 text-right flex gap-2 justify-end">
                          <button 
                            onClick={() => { 
                              setKycForm({ name: '', idNumber: '', documentUrl: '' }); 
                              setCurrentUser(prev => prev ? { ...prev, kycStatus: 'verified' } : null); 
                              spawnToast('KYC Phê Duyệt', 'Đã duyệt KYC thành công cho khách hàng!', 'success'); 
                            }} 
                            className="bg-success text-bg px-2.5 py-1 rounded font-bold hover:opacity-90"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => { 
                              setKycForm({ name: '', idNumber: '', documentUrl: '' }); 
                              setCurrentUser(prev => prev ? { ...prev, kycStatus: 'unverified' } : null); 
                              spawnToast('KYC Từ Chối', 'Đã từ chối KYC thành công!', 'error'); 
                            }} 
                            className="bg-danger text-white px-2.5 py-1 rounded font-bold hover:opacity-90"
                          >
                            Từ chối
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" /> Yêu Cầu Hỗ Trợ Đang Mở (Support Tickets)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface/30">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase">
                      <th className="px-4 py-2.5">Mã ID</th>
                      <th className="px-4 py-2.5">Chủ Đề</th>
                      <th className="px-4 py-2.5">Loại</th>
                      <th className="px-4 py-2.5">Trạng Thế</th>
                      <th className="px-4 py-2.5 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ticketsList.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-slate-500">Không có ticket nào cần xử lý.</td></tr>
                    ) : (
                      ticketsList.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition-all">
                          <td className="px-4 py-2.5 text-white font-bold">{t.id}</td>
                          <td className="px-4 py-2.5">{t.subject}</td>
                          <td className="px-4 py-2.5 text-primary font-bold">{t.category}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'open' ? 'bg-success/10 text-success' : 'bg-slate-700 text-slate-400'}`}>{t.status}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {t.status === 'open' ? (
                              <button 
                                onClick={() => handleResolveTicket(t.id.replace('TKT-', ''))} 
                                className="bg-primary text-bg px-2.5 py-1 rounded font-bold hover:opacity-90"
                              >
                                Giải Quyết
                              </button>
                            ) : (
                              <span className="text-slate-500">Đã xử lý</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
