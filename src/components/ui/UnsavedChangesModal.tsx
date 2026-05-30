import React, { useState } from 'react';
import { Save, AlertTriangle, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSaveAsDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSaveAsDraft,
  onDiscard,
  onCancel,
  isSaving = false
}) => {
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  if (!isOpen) {
    if (showConfirmDiscard) setShowConfirmDiscard(false);
    return null;
  }

  if (showConfirmDiscard) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              All your unsaved changes will be permanently lost. Do you want to proceed?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmDiscard(false)}
                className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                No, Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowConfirmDiscard(false);
                  onDiscard();
                }}
                className="px-4 py-2 font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md shadow-red-500/20"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unsaved Changes</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 pl-13">
            You have unsaved changes. What would you like to do before leaving?
          </p>
          <div className="space-y-3">
            <button
              onClick={onSaveAsDraft}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 p-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save as Draft
                </>
              )}
            </button>
            <button
              onClick={() => setShowConfirmDiscard(true)}
              disabled={isSaving}
              className="w-full p-3 font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel Edit (Discard Changes)
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="w-full p-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
