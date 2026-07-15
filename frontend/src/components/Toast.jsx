import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, ttl = 4000) => {
    const id = Date.now() + Math.random();
    const t = { id, type, message };
    setToasts((s) => [t, ...s]);
    setTimeout(() => {
      setToasts((s) => s.filter(x => x.id !== id));
    }, ttl);
  }, []);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm text-white ${t.type === 'error' ? 'bg-red-500' : 'bg-[#2dc275]'} `}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
