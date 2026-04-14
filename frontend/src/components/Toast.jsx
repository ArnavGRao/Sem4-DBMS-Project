import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const tone = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    error: 'border-orange-300 bg-orange-50 text-orange-900',
    info: 'border-cyan-300 bg-cyan-50 text-cyan-900',
    warning: 'border-amber-300 bg-amber-50 text-amber-900',
  }[type] || 'border-cyan-300 bg-cyan-50 text-cyan-900';

  const icon = {
    success: 'OK',
    error: '!',
    info: 'i',
    warning: '!',
  }[type] || 'i';

  return (
    <div
      className={`page-enter flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${tone}`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white/75 text-xs font-bold">
        {icon}
      </span>
      <span className="text-sm font-semibold leading-5">{message}</span>
    </div>
  );
};

export default Toast;
