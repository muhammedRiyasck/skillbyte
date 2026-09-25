import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning' | 'success';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          button: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
          iconBg: 'bg-red-100 dark:bg-red-900/50 text-red-600',
          accent: 'bg-red-600'
        };
      case 'warning':
        return {
          button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600',
          accent: 'bg-amber-600'
        };
      case 'success':
        return {
          button: 'bg-green-500 hover:bg-green-600 shadow-green-500/30',
          iconBg: 'bg-green-100 dark:bg-green-900/50 text-green-600',
          accent: 'bg-green-600'
        };
      default:
        return {
          button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30',
          iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600',
          accent: 'bg-indigo-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px]"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20 dark:border-slate-700 relative overflow-hidden z-10"
          >
            {/* Decorative background element */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-16 -mt-16 ${styles.accent}`} />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {icon && (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${styles.iconBg}`}>
                {icon}
              </div>
            )}

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {title}
            </h3>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-8 border border-slate-100 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full py-4  rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminConfirmModal;
