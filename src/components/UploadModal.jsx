import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadModal({ isOpen, onClose, onDataUploaded }) {
  const [collabFile, setCollabFile] = useState(null);
  const [fraisFile, setFraisFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'collab') setCollabFile(file);
      if (type === 'frais') setFraisFile(file);
    }
  };

  const processExcel = async () => {
    try {
      setLoading(true);
      setError(null);

      let newCollab = null;
      let newFrais = null;

      if (collabFile) {
        const collabBuffer = await collabFile.arrayBuffer();
        const wbCollab = XLSX.read(collabBuffer);
        const sheetName = wbCollab.SheetNames[0];
        newCollab = XLSX.utils.sheet_to_json(wbCollab.Sheets[sheetName], { defval: '' });
      }

      if (fraisFile) {
        const fraisBuffer = await fraisFile.arrayBuffer();
        const wbFrais = XLSX.read(fraisBuffer);
        const sheetName = wbFrais.SheetNames[0];
        newFrais = XLSX.utils.sheet_to_json(wbFrais.Sheets[sheetName], { defval: '' });
      }

      onDataUploaded({ newCollab, newFrais });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la lecture des fichiers Excel. Vérifiez le format des colonnes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-sky-500/15 text-sky-600 rounded-xl border border-sky-500/30">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Importer un Fichier Note de Frais</h3>
            <p className="text-xs text-slate-500">
              Chargez un nouveau fichier Excel <code className="text-sky-600 font-semibold">frais.xlsx</code> (Demandes GED)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 my-5">
          {/* Frais File Drop */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fichier Note de Frais (Demandes GED)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, 'frais')}
                className="hidden"
                id="frais-file-input"
              />
              <label
                htmlFor="frais-file-input"
                className="px-3 py-2 text-xs font-medium text-slate-800 bg-white hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200 flex items-center gap-2 shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                <span>Parcourir...</span>
              </label>
              <span className="text-xs text-slate-500 truncate flex-1">
                {fraisFile ? fraisFile.name : 'Aucun fichier sélectionné (utilise les données actuelles)'}
              </span>
              {fraisFile && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Annuler
          </button>
          <button
            onClick={processExcel}
            disabled={!fraisFile || loading}
            className={`px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 ${
              !fraisFile || loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-sky-400 hover:to-blue-500 cursor-pointer'
            }`}
          >
            <span>{loading ? 'Traitement en cours...' : 'Mettre à jour l\'analyse'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
