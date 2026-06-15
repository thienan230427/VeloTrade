import type { FormEvent } from 'react';

import { Plus } from 'lucide-react';
import type { Ticket } from '../types';

interface Props {
  ticketsList: Ticket[];
  showTicketForm: boolean;
  setShowTicketForm: (v: boolean) => void;
  ticketSubject: string;
  setTicketSubject: (v: string) => void;
  ticketCategory: string;
  setTicketCategory: (v: string) => void;
  handleSubmitTicket: (e: FormEvent) => void;
}

export default function SupportView({
  ticketsList,
  showTicketForm,
  setShowTicketForm,
  ticketSubject,
  setTicketSubject,
  ticketCategory,
  setTicketCategory,
  handleSubmitTicket
}: Props) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="max-w-[800px] mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-white">Trung Tâm Hỗ Trợ Khách Hàng (MySQL Linked)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tạo yêu cầu trợ giúp và lưu trực tiếp vào cơ sở dữ liệu MySQL.</p>
          </div>
          <button 
            onClick={() => setShowTicketForm(!showTicketForm)} 
            className="bg-primary hover:opacity-90 text-bg font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo Ticket Mới
          </button>
        </div>

        {showTicketForm && (
          <div className="glass-panel rounded-xl p-5 border border-primary/20 space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Tạo Yêu Cầu Trợ Giúp Mới</h3>
            <form onSubmit={handleSubmitTicket} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Chủ Đề</label>
                  <input 
                    type="text" 
                    value={ticketSubject} 
                    onChange={(e) => setTicketSubject(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Phân Loại</label>
                  <select 
                    value={ticketCategory} 
                    onChange={(e) => setTicketCategory(e.target.value)} 
                    className="w-full bg-[#111622] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="DEPOSIT">Nạp/Rút Tiền</option>
                    <option value="TRADING">Giao Dịch</option>
                    <option value="KYC">Xác Thực Danh Tính</option>
                    <option value="OTHER">Lỗi Khác</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="bg-primary text-bg font-bold px-4 py-2 rounded-lg text-xs hover:opacity-90 transition-all">GỬI TICKET</button>
              <button type="button" onClick={() => setShowTicketForm(false)} className="bg-white/5 text-slate-400 px-4 py-2 rounded-lg text-xs hover:bg-white/10 transition-all ml-2">HỦY</button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lịch Sử Yêu Cầu Của Sếp (Nạp từ MySQL)</h3>
          <div className="space-y-3">
            {ticketsList.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-xs">Chưa có yêu cầu hỗ trợ nào được ghi nhận.</p>
            ) : (
              ticketsList.map(t => (
                <div key={t.id} className="glass-panel rounded-lg p-4 border border-white/5 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{t.id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 border border-primary/20 text-primary font-bold">{t.category}</span>
                    </div>
                    <p className="text-xs text-white">{t.subject}</p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${t.status === 'open' ? 'bg-success/15 text-success' : 'bg-slate-700 text-slate-400'}`}>{t.status.toUpperCase()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
