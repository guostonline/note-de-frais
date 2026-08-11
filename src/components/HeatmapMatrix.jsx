import React, { useMemo } from 'react';
import { CheckCircle2, XCircle, Calendar, Info } from 'lucide-react';
import { getUniqueWeeks, matchDemandeurToCollaborateur, cleanStr } from '../utils/matching';

export default function HeatmapMatrix({ 
  collabList, 
  fraisList, 
  monthFilter, 
  selectedEntity, 
  searchQuery, 
  aliasMap 
}) {
  // Extract month list from filter (array, string, or ALL)
  const selectedMonths = useMemo(() => {
    if (!monthFilter || monthFilter === 'ALL') return [];
    if (Array.isArray(monthFilter)) {
      return monthFilter.filter(m => m !== 'ALL');
    }
    return [monthFilter];
  }, [monthFilter]);

  // Display title text
  const displayMonthText = selectedMonths.length > 0
    ? selectedMonths.join(', ')
    : (fraisList[0]?.Mois || 'Toutes les périodes');

  // Get weeks for the selected month(s)
  const weeks = getUniqueWeeks(fraisList, monthFilter);

  // Filter collaborateurs by Entity & Search
  const filteredCollabs = collabList.filter(c => {
    if (Array.isArray(selectedEntity) && selectedEntity.length > 0) {
      if (!selectedEntity.includes(c.Entite)) return false;
    } else if (typeof selectedEntity === 'string' && selectedEntity !== 'ALL') {
      if (c.Entite !== selectedEntity) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNom   = c.Nom?.toLowerCase().includes(q);
      const matchMat   = String(c.Matricule || '').toLowerCase().includes(q);
      const matchEnt   = c.Entite?.toLowerCase().includes(q);
      const matchFonct = c.Fonction?.toLowerCase().includes(q);
      const matchResp  = c.Responsable?.toLowerCase().includes(q);
      if (!matchNom && !matchMat && !matchEnt && !matchFonct && !matchResp) return false;
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

  // Filter frais items matching the selected month(s)
  const targetFrais = (fraisList || []).filter(f => {
    if (selectedMonths.length === 0) return true;
    return selectedMonths.some(m => {
      if (f.Mois === m) return true;
      // Handle variations like "Août" vs "Aot" or case variations
      return cleanStr(f.Mois) === cleanStr(m);
    });
  });

  // Fill matrix with frais data
  targetFrais.forEach(f => {
    const { collaborateur } = matchDemandeurToCollaborateur(f.Demandeur, collabList, aliasMap);
    if (collaborateur && matrixData[collaborateur.Nom]) {
      // Find matching week key
      const weekKey = weeks.find(w => w === f.Semaine || cleanStr(w) === cleanStr(f.Semaine));
      if (weekKey && matrixData[collaborateur.Nom][weekKey]) {
        matrixData[collaborateur.Nom][weekKey].push(f);
      }
    }
  });

  return (
    <div className="glass-panel rounded-2xl overflow-hidden p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            Matrice de Suivi Hebdomadaire — <span className="text-sky-600">{displayMonthText}</span>
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
