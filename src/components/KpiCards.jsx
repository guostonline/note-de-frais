import React from 'react';
import { Users, CheckCircle2, AlertCircle, FileText, Percent } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Collaborateurs */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Collaborateurs Actifs
          </span>
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCollab}</span>
          <span className="text-xs text-slate-500">personnes</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Effectif total configuré
        </p>
      </div>

      {/* Collaborateurs en Règle (Rempli) */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Ont Rempli (En Règle)
          </span>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{submittedCount}</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            {complianceRate}%
          </span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${complianceRate}%` }}
          />
        </div>
      </div>

      {/* Collaborateurs en Retard (Non Rempli) */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Non Remplies (En Retard)
          </span>
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{missingCount}</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
            {100 - complianceRate}%
          </span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-rose-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${100 - complianceRate}%` }}
          />
        </div>
      </div>

      {/* Total Frais Déposées */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
            Notes Déposées
          </span>
          <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-sky-600 tracking-tight">{totalSubmissionsInPeriod}</span>
          <span className="text-xs text-slate-500">demandes</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 truncate">
          Période: {monthFilter === 'ALL' ? 'Tous les mois' : monthFilter} • {weekFilter === 'ALL' ? 'Toutes semaines' : weekFilter}
        </p>
      </div>
    </div>
  );
}
