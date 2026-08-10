import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, Cell 
} from 'recharts';
import { BarChart3, ShieldCheck, Users } from 'lucide-react';
import { getUniqueEntities, getUniqueCdzCda } from '../utils/matching';

export default function AnalyticsCharts({ 
  collabList, 
  fraisList, 
  submissionMap, 
  monthFilter
}) {
  const gridColor = 'rgba(225, 218, 198, 0.5)';
  const textColor = '#555A65';
  const tooltipBg = '#FFFFFF';
  const tooltipBorder = 'rgba(225, 218, 198, 0.8)';
  const tooltipTextColor = '#1E2024';

  // 1. Calculate compliance by Entity (Left Chart)
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

  // 2. Calculate compliance by CDZ Responsable (Right Chart: Remplis vs Total)
  const cdzList = getUniqueCdzCda(collabList);
  const cdzData = cdzList.map(resp => {
    const collabsUnderCdz = collabList.filter(c => c.Responsable === resp);
    const total = collabsUnderCdz.length;
    let Remplis = 0;

    collabsUnderCdz.forEach(c => {
      if (submissionMap[c.Nom]?.hasSubmitted) {
        Remplis += 1;
      }
    });

    const NonRemplis = total - Remplis;
    const rate = total > 0 ? Math.round((Remplis / total) * 100) : 0;
    const shortName = resp.split(' ')[0] + ' ' + (resp.split(' ')[1] ? resp.split(' ')[1][0] + '.' : '');

    return {
      name: shortName,
      fullName: resp,
      Total: total,
      Remplis,
      NonRemplis,
      Taux: rate
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Compliance Rate by Entity */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between shadow-sm border border-stone-200/80">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-extrabold text-[#1E2024] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#22252A]" />
              Taux de Remplissage par Entité (%)
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F3CF55]/20 text-[#22252A]">
              {monthFilter === 'ALL' || !monthFilter.length ? 'Tous Mois' : Array.isArray(monthFilter) ? monthFilter.join(', ') : monthFilter}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mb-4">
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
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`${value}%`, 'Taux de conformité']}
                  labelFormatter={(name) => `Entité: ${name}`}
                />
                <Bar dataKey="TauxConformite" radius={[8, 8, 0, 0]}>
                  {entityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.TauxConformite >= 70 ? '#F3CF55' : entry.TauxConformite >= 40 ? '#22252A' : '#F43F5E'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200/80 flex justify-around text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F3CF55]"></div>
            <span>Conforme (&ge; 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22252A]"></div>
            <span>Moyen (40-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span>Faible (&lt; 40%)</span>
          </div>
        </div>
      </div>

      {/* Chart 2: CDZ Compliance (Remplis vs Non Remplis / Total) */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between shadow-sm border border-stone-200/80">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-extrabold text-[#1E2024] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#22252A]" />
              Remplissage par Responsable CDZ (Remplis / Total)
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#22252A] text-white">
              CDZ Breakdown
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mb-4">
            Nombre d'employés ayant rempli vs retardataires sous chaque CDZ/CDA
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cdzData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.7} />
                <XAxis 
                  dataKey="name" 
                  stroke={textColor} 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0} 
                />
                <YAxis stroke={textColor} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                  formatter={(value, name, item) => {
                    if (name === 'Remplis') return [`${value} / ${item.payload.Total} (${item.payload.Taux}%)`, 'Ont Rempli'];
                    if (name === 'NonRemplis') return [`${value} collaborateur(s)`, 'En Retard'];
                    return [value, name];
                  }}
                  labelFormatter={(name, payload) => payload[0] ? `CDZ: ${payload[0].payload.fullName}` : name}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: '600' }}
                  formatter={(value) => value === 'Remplis' ? 'Ont Rempli (En règle)' : 'Non Remplis (En retard)'}
                />
                <Bar dataKey="Remplis" fill="#F3CF55" radius={[6, 6, 0, 0]} name="Remplis" />
                <Bar dataKey="NonRemplis" fill="#22252A" radius={[6, 6, 0, 0]} name="NonRemplis" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200/80 text-xs text-stone-500 font-medium text-center">
          Barres dorées: Collaborateurs en règle • Barres noires: Retardataires par CDZ
        </div>
      </div>
    </div>
  );
}
