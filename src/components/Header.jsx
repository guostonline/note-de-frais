import React from 'react';
import { Upload, Link, RefreshCw, UserPlus, LogOut, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Header({ 
  totalCollab, 
  totalFrais, 
  onOpenUpload, 
  onOpenAliasMapper, 
  onResetData,
  onOpenAddCollab,
  onOpenFilters,
  currentUser,
  onLogout
}) {
  return (
    <header className="glass-panel sticky top-3 z-30 border border-stone-200/80 px-6 py-3.5 mb-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* MADEC Logo */}
        <div className="flex items-center gap-3.5">
          <div className="px-5 py-2 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200/80 hover:shadow-md transition-all">
            <img src={logoImg} alt="MADEC Logo" className="h-8 w-auto object-contain max-w-[140px]" />
          </div>
        </div>

        {/* User Profile & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#22252A] text-white rounded-full shadow-sm border border-stone-800">
              <div className="p-1 bg-[#F3CF55] text-[#1E2024] rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight text-stone-100">{currentUser.name}</div>
                <div className="text-[10px] text-[#F3CF55] font-medium leading-tight">{currentUser.email}</div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-1 p-1 text-stone-400 hover:text-rose-400 hover:bg-white/10 rounded-full transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E2024] bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full transition-all shadow-xs"
              title="Ajouter un collaborateur"
            >
              <UserPlus className="w-4 h-4 text-[#22252A]" />
              <span>+ Collaborateur</span>
            </button>
          )}

          <button
            onClick={onOpenAliasMapper}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E2024] bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full transition-all shadow-xs"
            title="Gérer les correspondances de noms"
          >
            <Link className="w-4 h-4 text-[#22252A]" />
            <span>Correspondances</span>
          </button>

          {/* Filtres Sidebar Button */}
          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#22252A] hover:bg-stone-700 rounded-full shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 border border-stone-700"
              title="Ouvrir les filtres & la navigation"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#F3CF55]" />
              <span>Filtres & Navigation</span>
            </button>
          )}

          {/* Gold Action Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#1E2024] bg-[#F3CF55] hover:bg-[#EBC046] rounded-full shadow-md shadow-[#F3CF55]/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Upload className="w-4 h-4" />
            <span>Importer Frais Excel</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2.5 text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200/80 rounded-full transition-all shadow-xs"
            title="Réinitialiser les données par défaut"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
