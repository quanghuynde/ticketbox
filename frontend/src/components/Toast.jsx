import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, message, ttl = 4000) => {
    const id = Date.now() + Math.random();
    const t = { id, type, message };
    setToasts((s) => [t, ...s]);
    setTimeout(() => {
      removeToast(id);
    }, ttl);
  }, [removeToast]);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => {
            const isError = t.type === 'error';
            const isSuccess = t.type === 'success';

            return (
              <div
                key={t.id}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-top-3 ${
                  isError
                    ? 'bg-zinc-900/95 border-rose-500/40 text-white shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                    : isSuccess
                      ? 'bg-zinc-900/95 border-[#2dc275]/40 text-white shadow-[0_0_25px_rgba(45,194,117,0.2)]'
                      : 'bg-zinc-900/95 border-white/15 text-white shadow-xl'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isError ? (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2dc275]" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 text-xs font-medium leading-relaxed">
                  {t.message}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
