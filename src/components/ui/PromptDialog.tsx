import React, { useState, useEffect } from 'react';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen, title, message, defaultValue = '', onConfirm, onCancel, confirmText = 'Submit', cancelText = 'Cancel', placeholder = ''
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(value);
              if (e.key === 'Escape') onCancel();
            }}
          />
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {cancelText}
          </button>
          <button onClick={() => onConfirm(value)} className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-lg transition-colors shadow-md shadow-secondary/20">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDialog;
