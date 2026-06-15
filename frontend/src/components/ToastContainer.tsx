
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { Toast } from '../types';

interface Props {
  toasts: Toast[];
}

export default function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`glass-panel pointer-events-auto p-4 rounded-xl border-l-4 w-72 flex gap-3 shadow-2xl transition-all duration-300 ${
            t.type === 'success' ? 'border-l-success' : 'border-l-danger'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold text-white">{t.title}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.msg}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
