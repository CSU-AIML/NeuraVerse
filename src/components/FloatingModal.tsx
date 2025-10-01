import { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface FloatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FloatingModal({ isOpen, onClose, children }: FloatingModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/50 z-[0]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 -translate-x-1/2 top-8 w-[calc(100%-2rem)] max-w-lg z-[10]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}


