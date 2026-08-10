import React from 'react';
import { Users, CheckCircle2, AlertCircle, FileText, TrendingUp, Sparkles } from 'lucide-react';

export default function KpiCards({ 
  totalCollab, 
  submittedCount, 
  missingCount, 
  totalSubmissionsInPeriod, 
  monthFilter, 
  weekFilter 
}) {
  const complianceRate = totalCollab > 0 ? Math.round((submittedCount / totalCollab) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Collaborateurs (White Card) */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Collaborateurs Actifs
          </span>
          <div className="p-2.5 bg-[#F6F4EB] text-[#22252A] rounded-2xl border border-stone-200/60">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl lg:text-5xl font-black text-[#1E2024] tracking-tight">{totalCollab}</span>
            <span className="text-xs font-semibold text-stone-400">personnes</span>
          </div>
          <p className="text-[11px] font-medium text-stone-500 mt-2">
            Effectif total enregistré
          </p>
        </div>
      </div>

      {/* 2. Ont Rempli (Gold Highlighted Card) */}
      <div className="glass-panel-gold p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#1E2024] uppercase tracking-wider">
            Ont Rempli (En Règle)
          </span>
          <div className="p-2 bg-[#1E2024] text-[#F3CF55] rounded-2xl shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-4xl lg:text-5xl font-black text-[#1E2024] tracking-tight">{submittedCount}</span>
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

      {/* 3. Non Remplies (Dark Widget Card) */}
      <div className="glass-panel-dark p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            En Retard (Non Remplies)
          </span>
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">{missingCount}</span>
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

      {/* 4. Total Notes Déposées (White Card) */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Notes Déposées
          </span>
          <div className="p-2.5 bg-[#F6F4EB] text-[#22252A] rounded-2xl border border-stone-200/60">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl lg:text-5xl font-black text-[#1E2024] tracking-tight">{totalSubmissionsInPeriod}</span>
            <span className="text-xs font-semibold text-stone-400">demandes</span>
          </div>
          <p className="text-[11px] font-medium text-stone-500 mt-2 truncate">
            Période: {monthFilter === 'ALL' ? 'Tous mois' : monthFilter} • {weekFilter === 'ALL' ? 'Toutes semaines' : weekFilter}
          </p>
        </div>
      </div>
    </div>
  );
}
