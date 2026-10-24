import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认执行',
  cancelText = '取消',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  // ESC 键退出监听
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 sm:p-7 shadow-2xl relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isDestructive 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'bg-[#0E2A20] text-[#CCFF00] border border-[#14382B]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="modal-title" className="text-lg font-bold text-[#F5F7F5] tracking-tight">
              {title}
            </h3>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 -mr-1 -mt-1 text-[#7E9385] hover:text-[#F5F7F5] rounded-lg hover:bg-[#0E2A20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
            aria-label="关闭弹窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#B3C4B8] leading-relaxed mb-6">
          {message}
        </p>

        {/* 严格遵循 Refactoring UI 按钮优先级: Primary vs Secondary */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Secondary 按钮: 低对比度表面 */}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-semibold text-[#B3C4B8] hover:text-[#F5F7F5] bg-[#06140F] hover:bg-[#0E2A20] border border-[#14382B] rounded-xl transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] whitespace-nowrap"
          >
            {cancelText}
          </button>

          {/* Primary 按钮: 唯一的强意图操作 */}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 min-h-[42px] text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-sm whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
                : 'bg-[#CCFF00] hover:bg-[#B8E600] text-black shadow-[#CCFF00]/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
