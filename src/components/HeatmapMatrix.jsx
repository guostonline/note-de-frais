import React from 'react';
import { CheckCircle2, XCircle, Calendar, Info } from 'lucide-react';
import { getUniqueWeeks, matchDemandeurToCollaborateur } from '../utils/matching';

export default function HeatmapMatrix({ 
  collabList, 
  fraisList, 
  monthFilter, 
  selectedEntity, 
  searchQuery, 
  aliasMap 
}) {
  // Determine relevant month (if ALL, pick first available or Juin)
  const currentMonth = monthFilter === 'ALL' ? (fraisList[0]?.Mois || 'Juin') : monthFilter;

  // Get weeks for currentMonth
  const weeks = getUniqueWeeks(fraisList, currentMonth);

  // Filter colaboradores by Entity & Search
  const filteredCollabs = collabList.filter(c => {
    if (selectedEntity !== 'ALL' && c.Entite !== selectedEntity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNom = c.Nom?.toLowerCase().includes(q);
      const matchMat = String(c.Matricule || '').toLowerCase().includes(q);
      const matchEnt = c.Entite?.toLowerCase().includes(q);
      if (!matchNom && !matchMat && !matchEnt) return false;
    }
    return true;
  });

  // Pre-calculate submissions map: CollabNom -> { WeekStr: [fraisObj] }
  const matrixData = {};
  filteredCollabs.forEach(c => {
    matrixData[c.Nom] = {};
    weeks.forEach(w => {
      matrixData[c.Nom][w] = [];
    });
  });

  // Fill matrix with frais data for currentMonth
  fraisList
    .filter(f => f.Mois === currentMonth)
    .forEach(f => {
      const { collaborateur } = matchDemandeurToCollaborateur(f.Demandeur, collabList, aliasMap);
      if (collaborateur && matrixData[collaborateur.Nom] && matrixData[collaborateur.Nom][f.Semaine]) {
        matrixData[collaborateur.Nom][f.Semaine].push(f);
      }
    });

  return (
    <div className="glass-panel rounded-2xl overflow-hidden p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            Matrice de Suivi Hebdomadaire — <span className="text-sky-600">{currentMonth}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Aperçu visuel des dépôts de notes de frais par collaborateur pour chaque semaine du mois
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Note Déposée</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-800 font-medium">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Non Déposée</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100 z-10">
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-3 px-4 font-semibold min-w-[200px] bg-slate-100">Collaborateur</th>
              <th className="py-3 px-3 font-semibold min-w-[140px] bg-slate-100">Entité</th>
              {weeks.map(w => (
                <th key={w} className="py-3 px-3 font-semibold text-center min-w-[100px] bg-slate-100">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-sky-700 font-mono text-[11px] font-bold shadow-2xs">
                    {w}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCollabs.length === 0 ? (
              <tr>
                <td colSpan={2 + weeks.length} className="py-12 text-center text-slate-500">
                  Aucun collaborateur ne correspond à vos filtres.
                </td>
              </tr>
            ) : (
              filteredCollabs.map(c => {
                const cMap = matrixData[c.Nom] || {};
                return (
                  <tr key={c.Nom} className="hover:bg-slate-100/80 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {c.Nom}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      <span className="truncate block max-w-[130px]">{c.Entite}</span>
                    </td>
                    {weeks.map(w => {
                      const submissions = cMap[w] || [];
                      const hasSub = submissions.length > 0;
                      return (
                        <td key={w} className="py-2.5 px-3 text-center">
                          {hasSub ? (
                            <div 
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium"
                              title={`${submissions.length} note(s) déposée(s) pour ${w}`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              {submissions.length > 1 && (
                                <span className="ml-1 text-[10px] font-bold">x{submissions.length}</span>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 text-rose-400 border border-rose-100">
                              <XCircle className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Affichage de {filteredCollabs.length} collaborateur(s) pour {weeks.length} semaine(s)</span>
        <span className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5" /> Changez le filtre "Mois" pour visualiser une autre période
        </span>
      </div>
    </div>
  );
}
