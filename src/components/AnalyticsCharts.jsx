import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, Cell 
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { getUniqueEntities, matchDemandeurToCollaborateur } from '../utils/matching';

export default function AnalyticsCharts({ 
  collabList, 
  fraisList, 
  submissionMap, 
  monthFilter, 
  aliasMap
}) {
  const gridColor = '#e2e8f0';
  const textColor = '#64748b';
  const tooltipBg = '#ffffff';
  const tooltipBorder = '#cbd5e1';
  const tooltipTextColor = '#0f172a';

  // 1. Calculate compliance by Entity
  const entities = getUniqueEntities(collabList);
  const entityData = entities.map(ent => {
    const collabsInEnt = collabList.filter(c => c.Entite === ent);
    const total = collabsInEnt.length;
    let submitted = 0;

    collabsInEnt.forEach(c => {
      if (submissionMap[c.Nom]?.hasSubmitted) {
        submitted += 1;
      }
    });

    const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return {
      name: ent.replace('Commercial ', 'Comm. ').replace('Agadir', '').trim(),
      fullEntity: ent,
      Total: total,
      Remplis: submitted,
      NonRemplis: total - submitted,
      TauxConformite: rate
    };
  });

  // 2. Weekly submissions trend across selected month
  const weeks = Array.from(new Set(fraisList.map(f => f.Semaine).filter(Boolean))).sort();
  const filteredFrais = monthFilter === 'ALL' ? fraisList : fraisList.filter(f => f.Mois === monthFilter);

  const weeklyTrendData = weeks.map(w => {
    const count = filteredFrais.filter(f => f.Semaine === w).length;
    return {
      semaine: w,
      submissions: count
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Compliance Rate by Entity */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Taux de Remplissage par Entité (%)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {monthFilter === 'ALL' ? 'Tous Mois' : monthFilter}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Pourcentage des collaborateurs ayant soumis leur note de frais par service
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.7} />
                <XAxis 
                  dataKey="name" 
                  stroke={textColor} 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0} 
                />
                <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, 'Taux de conformité']}
                  labelFormatter={(name) => `Entité: ${name}`}
                />
                <Bar dataKey="TauxConformite" radius={[6, 6, 0, 0]}>
                  {entityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.TauxConformite >= 70 ? '#10b981' : entry.TauxConformite >= 40 ? '#0284c7' : '#f43f5e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-around text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>Conforme (&ge; 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-sky-500"></div>
            <span>Moyen (40-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500"></div>
            <span>Faible (&lt; 40%)</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Weekly Submissions Volume */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Volume des Notes Déposées par Semaine
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {filteredFrais.length} notes au total
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Évolution hebdomadaire du nombre de demandes créées dans le système GED
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.7} />
                <XAxis 
                  dataKey="semaine" 
                  stroke={textColor} 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end" 
                />
                <YAxis stroke={textColor} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} notes`, 'Volume de soumission']}
                />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#0284c7" 
                  strokeWidth={3} 
                  dot={{ fill: '#38bdf8', r: 5 }} 
                  activeDot={{ r: 8, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 text-center">
          Activité enregistrée pour la période sélectionnée ({monthFilter === 'ALL' ? 'Tous les Mois' : monthFilter})
        </div>
      </div>
    </div>
  );
}
