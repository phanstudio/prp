import React, { createContext, useContext, useState, useCallback } from 'react';

// Types
type ToastType = 'info' | 'success' | 'warning' | 'error'| 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string, nowait?: boolean) => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id; // Return the ID!
  }, []);

  const removeToast = useCallback((id: string, nowait: boolean = false) => {
    // First, mark the toast as exiting to trigger animation
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, isExiting: true } : toast
    ));

    if (nowait){
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }else{
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 300); // Match animation duration
    }
  }, []);

  const getToastStyles = (type: ToastType, isExiting?: boolean) => {
    // const baseStyles = 'px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 min-w-[300px] max-w-md animate-slide-in';
    const animationClass = isExiting ? 'animate-slide-out' : 'animate-slide-in';
    const alertStyle = `alert min-w-[300px] max-w-md animate-slide-in transition-all duration-300 ${animationClass}`
    
    switch (type) {
      case 'success':
        return `${alertStyle} alert-success`;
      case 'error':
        return `${alertStyle} alert-error`;
      case 'warning':
        return `${alertStyle} alert-warning`;
      case 'info':
        return `${alertStyle} alert-info`;
      case 'loading':
        return `${alertStyle} alert-info`; // alert-soft
      default:
        return `${alertStyle}`;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
        case 'loading':
          return (
            <span className="loading loading-spinner loading-md"></span>
          );
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast toast-top toast-end z-[1000]">
        {toasts.map(toast => (
          <div key={toast.id} className={getToastStyles(toast.type, toast.isExiting)} role="alert" >
            {getIcon(toast.type)}
            <span className="flex-1">{toast.message}</span>
            {/* <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-80 transition-opacity"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button> */}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-in;
        }
      `}</style>
    </ToastContext.Provider>
  );
};


// examples
// addToast('Message sent!', 'success', 3000);
// addToast('Message sent!', 'error', 4000);
// addToast('Message sent!', 'info', 5000);
// addToast('Message sent!', 'warning', 6000);
// const loadingToast = addToast(`Creating Template: ${templateName.trim().substring(0, 10)}`, 'loading', 0);
// removeToast(loadingToast);