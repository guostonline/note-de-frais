import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  collaboratorName 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 transform transition-all p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Supprimer Collaborateur ?
        </h3>
        
        <p className="text-xs text-slate-600 mb-6">
          Êtes-vous sûr de vouloir supprimer <strong className="text-slate-900">{collaboratorName}</strong> de la liste ? Cette action est réversible en réinitialisant les données.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
