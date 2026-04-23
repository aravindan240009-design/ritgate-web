import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'bg-indigo-500 hover:bg-indigo-600',
  icon,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-7 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-9 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-5">
          <div className="w-22 h-22 rounded-full bg-indigo-50 flex items-center justify-center">
            <div className="w-17 h-17 rounded-full bg-indigo-100 flex items-center justify-center">
              {icon || <AlertCircle className="w-9 h-9 text-indigo-500" />}
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-800 mb-2.5 text-center tracking-tight">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed text-center mb-8 px-2">
          {message}
        </p>

        <div className="flex gap-3">
          {cancelText && (
            <button
              onClick={onCancel}
              className="flex-1 h-13 rounded-2xl bg-slate-100 border-1.5 border-slate-200 text-slate-600 font-bold text-base transition-all hover:bg-slate-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 h-13 rounded-2xl ${confirmColor} text-white font-extrabold text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
          >
            {icon && <span className="w-4.5 h-4.5">{icon}</span>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
