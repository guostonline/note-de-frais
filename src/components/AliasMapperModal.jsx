import React, { useState } from 'react';
import { Link, X, Check, Save, UserCheck, AlertCircle } from 'lucide-react';
import { matchDemandeurToCollaborateur } from '../utils/matching';

export default function AliasMapperModal({ 
  isOpen, 
  onClose, 
  fraisList, 
  collabList, 
  aliasMap, 
  onSaveAliases 
}) {
  if (!isOpen) return null;

  // Find all unique demandeurs from fraisList
  const demandeurs = Array.from(new Set(fraisList.map(f => f.Demandeur).filter(Boolean))).sort();

  // Local state for alias edits
  const [localAliases, setLocalAliases] = useState({ ...aliasMap });

  const handleSelectAlias = (demandeur, selectedCollabNom) => {
    setLocalAliases(prev => {
      const next = { ...prev };
      if (!selectedCollabNom) {
        delete next[demandeur];
      } else {
        next[demandeur] = selectedCollabNom;
      }
      return next;
    });
  };

  const saveAndClose = () => {
    onSaveAliases(localAliases);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-600 rounded-xl border border-indigo-500/30">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Correspondance des Noms (Demandeur &rarr; Collaborateur)</h3>
            <p className="text-xs text-slate-500">
              Associez manuellement les demandeurs dont le nom varie entre le fichier Frais et la liste Collaborateurs
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 my-4 space-y-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3">Nom Demandeur (Frais)</th>
                <th className="py-2.5 px-3 text-center">Score Auto</th>
                <th className="py-2.5 px-3">Collaborateur Identifié / Associé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {demandeurs.map(demandeur => {
                const { collaborateur, score, isAlias } = matchDemandeurToCollaborateur(demandeur, collabList, localAliases);
                const currentMappedNom = localAliases[demandeur] || (collaborateur ? collaborateur.Nom : '');

                return (
                  <tr key={demandeur} className="hover:bg-slate-100/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {demandeur}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isAlias ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold text-[10px]">
                          Manuel
                        </span>
                      ) : score >= 0.7 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px]">
                          {Math.round(score * 100)}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px]">
                          {Math.round(score * 100)}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={currentMappedNom}
                        onChange={(e) => handleSelectAlias(demandeur, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-sky-500 outline-none shadow-2xs"
                      >
                        <option value="">-- Non Associé (Ignorer) --</option>
                        {collabList.map(c => (
                          <option key={c.Nom} value={c.Nom}>
                            {c.Nom} ({c.Entite})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            {Object.keys(localAliases).length} correspondance(s) manuelle(s) enregistrée(s)
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              onClick={saveAndClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-600 rounded-xl shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-sky-500 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Correspondances</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
