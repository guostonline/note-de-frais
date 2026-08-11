import React from 'react';
import { Users, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function KpiCards({ 
  totalCollab, 
  submittedCount, 
  missingCount, 
  totalSubmissionsInPeriod, 
  monthFilter, 
  weekFilter,
  activeTab,
  onCollaborateursClick,
  onSubmittedClick,
  onMissingClick,
}) {
  const complianceRate = totalCollab > 0 ? Math.round((submittedCount / totalCollab) * 100) : 0;

  const cardBase = "glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer select-none";
  const activeRing = "ring-2 ring-offset-2";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">

      {/* 1. Total Collaborateurs */}
      <div
        onClick={onCollaborateursClick}
        className={`${cardBase} ${activeTab === 'ALL' ? `${activeRing} ring-stone-400` : 'hover:ring-2 hover:ring-stone-200 hover:ring-offset-2'}`}
        title="Voir tous les collaborateurs"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider leading-tight">
            Collaborateurs Actifs
          </span>
          <div className="p-2 sm:p-2.5 bg-[#F6F4EB] text-[#22252A] rounded-xl sm:rounded-2xl border border-stone-200/60">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E2024] tracking-tight">{totalCollab}</span>
            <span className="text-xs font-semibold text-stone-400">personnes</span>
          </div>
          <p className="text-[11px] font-medium text-stone-500 mt-2">
            Effectif total enregistré
          </p>
        </div>
      </div>

      {/* 2. Ont Rempli (Gold) */}
      <div
        onClick={onSubmittedClick}
        className={`glass-panel-gold p-5 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer select-none ${activeTab === 'SUBMITTED' ? `${activeRing} ring-yellow-500` : 'hover:ring-2 hover:ring-yellow-400 hover:ring-offset-2'}`}
        title="Voir les collaborateurs en règle"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold text-[#1E2024] uppercase tracking-wider leading-tight">
            Ont Rempli (En Règle)
          </span>
          <div className="p-2 sm:p-2 bg-[#1E2024] text-[#F3CF55] rounded-xl sm:rounded-2xl shadow-sm">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E2024] tracking-tight">{submittedCount}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1E2024] text-[#F3CF55] shadow-xs">
              {complianceRate}%
            </span>
          </div>
          <div className="w-full bg-[#1E2024]/15 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#1E2024] h-full rounded-full transition-all duration-500"
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. En Retard (Dark) */}
      <div
        onClick={onMissingClick}
        className={`glass-panel-dark p-5 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 cursor-pointer select-none ${activeTab === 'MISSING' ? `${activeRing} ring-rose-500` : 'hover:ring-2 hover:ring-rose-500 hover:ring-offset-2'}`}
        title="Voir les collaborateurs en retard"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider leading-tight">
            En Retard (Non Remplies)
          </span>
          <div className="p-2 sm:p-2.5 bg-rose-500/20 text-rose-400 rounded-xl sm:rounded-2xl border border-rose-500/30">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">{missingCount}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {100 - complianceRate}%
            </span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${100 - complianceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Notes Déposées (info only) */}
      <div className={`${cardBase} cursor-default`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider leading-tight">
            Notes Déposées
          </span>
          <div className="p-2 sm:p-2.5 bg-[#F6F4EB] text-[#22252A] rounded-xl sm:rounded-2xl border border-stone-200/60">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E2024] tracking-tight">{totalSubmissionsInPeriod}</span>
            <span className="text-xs font-semibold text-stone-400">demandes</span>
          </div>
          <p className="text-[11px] font-medium text-stone-500 mt-2 truncate">
            Période: {Array.isArray(monthFilter) ? (monthFilter.length === 0 ? 'Tous mois' : monthFilter.join(', ')) : (monthFilter === 'ALL' ? 'Tous mois' : monthFilter)} • {weekFilter === 'ALL' ? 'Toutes semaines' : weekFilter}
          </p>
        </div>
      </div>
    </div>
  );
}
