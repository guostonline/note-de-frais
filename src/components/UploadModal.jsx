import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadModal({ isOpen, onClose, onDataUploaded }) {
  const [fraisFile, setFraisFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Veuillez sélectionner un fichier Excel valide (.xlsx ou .xls)');
        return;
      }
      setError(null);
      setFraisFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processExcel = async () => {
    if (!fraisFile) return;

    try {
      setLoading(true);
      setError(null);

      const fraisBuffer = await fraisFile.arrayBuffer();
      const wbFrais = XLSX.read(fraisBuffer);
      const sheetName = wbFrais.SheetNames[0];
      const newFrais = XLSX.utils.sheet_to_json(wbFrais.Sheets[sheetName], { defval: '' });

      onDataUploaded({ newFrais });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la lecture du fichier Excel. Vérifiez le format des colonnes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto pb-safe animate-slide-up-mobile sm:animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-sky-500/15 text-sky-600 rounded-xl border border-sky-500/30">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Importer Note de Frais</h3>
            <p className="text-xs text-slate-500">
              Mise à jour des demandes GED (<code className="text-sky-600 font-semibold">frais.xlsx</code>)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div className="my-5">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
            className="hidden"
            id="frais-file-dropzone"
          />

          {!fraisFile ? (
            <label
              htmlFor="frais-file-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-sky-500 bg-sky-50 shadow-inner scale-[0.99]'
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/40'
              }`}
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-sky-500">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Glissez & déposez votre fichier <span className="text-sky-600">frais.xlsx</span> ici
                </p>
                <p className="text-[11px] text-slate-400">
                  ou <span className="text-sky-600 font-semibold underline">cliquez pour parcourir</span> (Formats .xlsx, .xls)
                </p>
              </div>
            </label>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-sm shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{fraisFile.name}</p>
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    {(fraisFile.size / 1024).toFixed(1)} KB • Fichier prêt pour l'analyse
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFraisFile(null)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Changer de fichier"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
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
