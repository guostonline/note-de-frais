import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link, RotateCcw, UserPlus, LogOut, MoreHorizontal, X, Mail, Cloud, RefreshCw } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Header({ 
  totalCollab, 
  totalFrais, 
  onOpenUpload, 
  onOpenAliasMapper, 
  onResetData,
  onOpenAddCollab,
  currentUser,
  onLogout,
  isCloudConnected,
  isSyncing,
  onSync
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="glass-panel sticky top-0 sm:top-3 z-30 border-b sm:border border-stone-200/80 px-4 sm:px-6 py-3 sm:py-3.5 mb-5 sm:mb-8 shadow-sm rounded-none sm:rounded-[1.75rem]">
      <div className="max-w-7xl mx-auto">
        {/* Main row */}
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img
              src={logoImg}
              alt="MADEC Logo"
              className="h-10 sm:h-12 w-auto object-contain max-w-[180px] sm:max-w-[220px]"
            />
          </div>

          {/* ── Desktop actions (md+) ── */}
          <div className="hidden md:flex items-center gap-2.5">

            {/* Cloud Sync Status Indicator & Manual Refresh */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-full border transition-all ${
                  isCloudConnected
                    ? 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200/80'
                    : 'text-stone-600 bg-stone-50 hover:bg-stone-100 border-stone-200'
                }`}
                title={isCloudConnected ? 'Base de données Cloud synchronisée (cliquer pour actualiser)' : 'Mode local / Cliquez pour synchroniser'}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-600' : isCloudConnected ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span>{isSyncing ? 'Synchro...' : isCloudConnected ? 'Cloud Actif' : 'Actualiser'}</span>
              </button>
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

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#1E2024] bg-[#F3CF55] hover:bg-[#EBC046] rounded-full shadow-md shadow-[#F3CF55]/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Upload className="w-4 h-4" />
              <span>Importer Frais Excel</span>
            </button>

            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-full transition-all shadow-2xs"
              title="Réinitialiser la base aux fichiers d'origine (Reset Usine)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden xl:inline">Réinitialiser Usine</span>
            </button>

            {/* ── Avatar circle with dropdown ── */}
            {currentUser && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(prev => !prev)}
                  className="w-9 h-9 rounded-full bg-[#F3CF55] text-[#1E2024] flex items-center justify-center font-extrabold text-sm shadow-md hover:bg-[#EBC046] hover:scale-105 transition-all"
                  title={currentUser.name}
                >
                  {(currentUser.name || '?')[0].toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#22252A] text-white rounded-2xl shadow-2xl border border-stone-700/80 overflow-hidden z-50 animate-fade-in">
                    {/* User info */}
                    <div className="px-4 py-3.5 border-b border-stone-700/60">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F3CF55] text-[#1E2024] flex items-center justify-center font-extrabold text-sm shrink-0">
                          {(currentUser.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-100 truncate">{currentUser.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-[#F3CF55] shrink-0" />
                            <div className="text-[10px] text-[#F3CF55] truncate">{currentUser.email}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Logout */}
                    {onLogout && (
                      <button
                        onClick={() => { onLogout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Se Déconnecter
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile actions (< md) ── */}
          <div className="flex md:hidden items-center gap-2">
            {/* Sync icon */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="p-2 text-stone-600 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full transition-all"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
              </button>
            )}

            {/* Upload — always visible gold */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1E2024] bg-[#F3CF55] hover:bg-[#EBC046] rounded-full shadow-md shadow-[#F3CF55]/20 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer</span>
            </button>

            {/* Reset — icon only */}
            <button
              onClick={onResetData}
              className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-full transition-all"
              title="Réinitialiser la base aux fichiers d'origine"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Avatar circle (mobile) */}
            {currentUser && (
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="w-8 h-8 rounded-full bg-[#F3CF55] text-[#1E2024] flex items-center justify-center font-extrabold text-sm shadow-md hover:bg-[#EBC046] transition-all"
                title={currentUser.name}
              >
                {(currentUser.name || '?')[0].toUpperCase()}
              </button>
            )}

            {/* More — hamburger toggle (when no user) */}
            {!currentUser && (
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-2 text-stone-600 bg-white hover:bg-stone-100 border border-stone-200/80 rounded-full transition-all"
                title="Plus d'options"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile expanded menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-stone-200/80 space-y-2 animate-fade-in">
            {/* User info + logout */}
            {currentUser && (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#22252A] text-white rounded-2xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#F3CF55] text-[#1E2024] flex items-center justify-center font-extrabold text-sm shrink-0">
                    {(currentUser.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-100 truncate">{currentUser.name}</div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#F3CF55] shrink-0" />
                      <div className="text-[10px] text-[#F3CF55] truncate">{currentUser.email}</div>
                    </div>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded-full transition-colors ml-2 shrink-0"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Add Collaborateur */}
            {onOpenAddCollab && (
              <button
                onClick={() => { onOpenAddCollab(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#1E2024] bg-white hover:bg-stone-50 border border-stone-200/80 rounded-2xl transition-all"
              >
                <UserPlus className="w-4 h-4 text-[#22252A]" />
                <span>+ Ajouter un Collaborateur</span>
              </button>
            )}

            {/* Correspondances */}
            <button
              onClick={() => { onOpenAliasMapper(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#1E2024] bg-white hover:bg-stone-50 border border-stone-200/80 rounded-2xl transition-all"
            >
              <Link className="w-4 h-4 text-[#22252A]" />
              <span>Correspondances de Noms</span>
            </button>

          </div>
        )}
      </div>
    </header>
  );
}
