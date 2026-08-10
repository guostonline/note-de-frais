import React from 'react';
import { FileSpreadsheet, Upload, Link, RefreshCw, UserPlus, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({ 
  totalCollab, 
  totalFrais, 
  onOpenUpload, 
  onOpenAliasMapper, 
  onResetData,
  onOpenAddCollab,
  currentUser,
  onLogout
}) {
  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-slate-200 px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20">
            <FileSpreadsheet className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Note de Frais <span className="text-sky-600">Comparator</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 font-normal border border-sky-500/20">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Suivi & comparaison en temps réel ({totalCollab} collaborateurs • {totalFrais} notes enregistrées)
            </p>
          </div>
        </div>

        {/* User Profile & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-sm border border-slate-800">
              <div className="p-1 bg-sky-500/20 rounded-lg text-sky-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-sky-300 font-medium leading-tight">{currentUser.email}</div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-1 p-1 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                  title="Se Déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {onOpenAddCollab && (
            <button
              onClick={onOpenAddCollab}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-sm"
              title="Ajouter un collaborateur"
            >
              <UserPlus className="w-4 h-4 text-sky-600" />
              <span>+ Collaborateur</span>
            </button>
          )}

          <button
            onClick={onOpenAliasMapper}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-sm"
            title="Gérer les correspondances de noms"
          >
            <Link className="w-4 h-4 text-sky-600" />
            <span>Correspondances de noms</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-lg shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importer nouveaux Fichiers Excel</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            title="Réinitialiser les données par défaut"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
