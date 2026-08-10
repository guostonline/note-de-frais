import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronRight, ExternalLink, 
  Mail, Download, Copy, Check, Info, FileSpreadsheet,
  UserPlus, Edit3, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getEntityBadgeColor, getFonctionBadgeColor, getResponsableSelectStyle } from '../utils/colors';

export default function CollaboratorTable({ 
  submissionMap, 
  collabList, 
  searchQuery, 
  selectedEntity, 
  selectedCdz = 'ALL',
  selectedFonction = 'ALL',
  monthFilter, 
  weekFilter,
  cdzCdaList = [],
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onUpdateResponsable
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'SUBMITTED', 'MISSING'
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [sortField, setSortField] = useState('Nom');
  const [sortOrder, setSortOrder] = useState('asc');

  // Convert submissionMap to array
  const rows = collabList.map(c => {
    const data = submissionMap[c.Nom] || { submissions: [], hasSubmitted: false };
    return {
      collaborateur: c,
      hasSubmitted: data.hasSubmitted,
      submissions: data.submissions
    };
  });

  // Filter rows by Search, Entity, CDZ, and Fonction (supporting multi-select arrays)
  const filteredRows = rows.filter(({ collaborateur, hasSubmitted }) => {
    // Entity filter
    if (Array.isArray(selectedEntity) && selectedEntity.length > 0) {
      if (!selectedEntity.includes(collaborateur.Entite)) return false;
    } else if (typeof selectedEntity === 'string' && selectedEntity !== 'ALL') {
      if (collaborateur.Entite !== selectedEntity) return false;
    }

    // CDZ Responsable filter
    if (Array.isArray(selectedCdz) && selectedCdz.length > 0) {
      const includesNone = selectedCdz.includes('NONE');
      const matchesResponsable = selectedCdz.includes(collaborateur.Responsable);
      const isUnassigned = !collaborateur.Responsable;
      if (!(matchesResponsable || (includesNone && isUnassigned))) return false;
    } else if (typeof selectedCdz === 'string' && selectedCdz !== 'ALL') {
      if (selectedCdz === 'NONE' && collaborateur.Responsable) return false;
      if (selectedCdz !== 'NONE' && collaborateur.Responsable !== selectedCdz) return false;
    }

    // Fonction filter
    if (Array.isArray(selectedFonction) && selectedFonction.length > 0) {
      if (!selectedFonction.includes(collaborateur.Fonction)) return false;
    } else if (typeof selectedFonction === 'string' && selectedFonction !== 'ALL') {
      if (collaborateur.Fonction !== selectedFonction) return false;
    }
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNom = collaborateur.Nom?.toLowerCase().includes(q);
      const matchMat = String(collaborateur.Matricule || '').toLowerCase().includes(q);
      const matchEnt = collaborateur.Entite?.toLowerCase().includes(q);
      const matchFonct = collaborateur.Fonction?.toLowerCase().includes(q);
      const matchResp = collaborateur.Responsable?.toLowerCase().includes(q);
      if (!matchNom && !matchMat && !matchEnt && !matchFonct && !matchResp) return false;
    }
    // Tab filter
    if (activeTab === 'SUBMITTED' && !hasSubmitted) return false;
    if (activeTab === 'MISSING' && hasSubmitted) return false;

    return true;
  });

  // Sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    let valA = a.collaborateur[sortField] || '';
    let valB = b.collaborateur[sortField] || '';

    if (sortField === 'Status') {
      valA = a.hasSubmitted ? '1' : '0';
      valB = b.hasSubmitted ? '1' : '0';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleRowExpand = (nom) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(nom)) next.delete(nom);
      else next.add(nom);
      return next;
    });
  };

  // Counts for tabs
  const allCount = rows.filter(({ collaborateur }) => {
    if (selectedEntity !== 'ALL' && collaborateur.Entite !== selectedEntity) return false;
    return true;
  }).length;

  const submittedCount = rows.filter(({ collaborateur, hasSubmitted }) => {
    if (selectedEntity !== 'ALL' && collaborateur.Entite !== selectedEntity) return false;
    return hasSubmitted;
  }).length;

  const missingCount = allCount - submittedCount;

  // Export Missing Collaborators to Excel
  const exportMissingToExcel = () => {
    const missingData = sortedRows
      .filter(r => !r.hasSubmitted)
      .map(r => ({
        Matricule: r.collaborateur.Matricule,
        Nom: r.collaborateur.Nom,
        Entité: r.collaborateur.Entite,
        Fonction: r.collaborateur.Fonction,
        Responsable_CDZ_CDA: r.collaborateur.Responsable || 'Non assigné',
        Statut: 'NON REMPLI',
        Mois: monthFilter === 'ALL' ? 'Tous' : monthFilter,
        Semaine: weekFilter === 'ALL' ? 'Toutes' : weekFilter
      }));

    const ws = XLSX.utils.json_to_sheet(missingData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Retardataires Note de Frais");
    XLSX.writeFile(wb, `Retardataires_Frais_${monthFilter}_${weekFilter}.xlsx`);
  };

  // Copy Email Reminder Template
  const copyEmailReminder = () => {
    const missingNames = sortedRows.filter(r => !r.hasSubmitted).map(r => `- ${r.collaborateur.Nom} (${r.collaborateur.Entite} - Resp: ${r.collaborateur.Responsable || 'N/A'})`);
    const periodText = `${monthFilter === 'ALL' ? 'du mois' : `de ${monthFilter}`} ${weekFilter === 'ALL' ? '' : `(${weekFilter})`}`;

    const text = `Bonjour,\n\nMerci de noter que les collaborateurs suivants n'ont pas encore soumis leur Note de Frais pour la période ${periodText} :\n\n${missingNames.join('\n')}\n\nMerci de régulariser la situation dans les meilleurs délais.\nCordialement,\nService Contrôle de Gestion & RH`;

    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header Tabs & Actions */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Tous les Collaborateurs</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
              {allCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SUBMITTED')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'SUBMITTED'
                ? 'bg-emerald-600 text-white border border-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ont Rempli</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {submittedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MISSING')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'MISSING'
                ? 'bg-rose-600 text-white border border-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Non Remplis (En Retard)</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
              {missingCount}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Collaborator Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-all shadow-sm"
            title="Ajouter un nouveau collaborateur"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Nouveau Collaborateur</span>
          </button>

          {missingCount > 0 && (
            <>
              <button
                onClick={copyEmailReminder}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all shadow-sm"
                title="Copier un modèle d'email de relance pour les retardataires"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-amber-600" /> : <Mail className="w-3.5 h-3.5 text-amber-600" />}
                <span>{copiedEmail ? 'Email Copié !' : 'Relance Email'}</span>
              </button>

              <button
                onClick={exportMissingToExcel}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all shadow-sm"
                title="Télécharger la liste Excel des retardataires"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exporter Retardataires</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-3 px-4 w-10"></th>
              <th 
                onClick={() => toggleSort('Nom')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Collaborateur {sortField === 'Nom' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => toggleSort('Entite')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Entité / Service {sortField === 'Entite' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4">Fonction</th>
              <th className="py-3 px-4">Responsable CDZ / CDA</th>
              <th 
                onClick={() => toggleSort('Status')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-center"
              >
                Statut {sortField === 'Status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-4 text-right">Notes Déposées</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  Aucun collaborateur ne correspond aux critères sélectionnés.
                </td>
              </tr>
            ) : (
              sortedRows.map(({ collaborateur, hasSubmitted, submissions }) => {
                const isExpanded = expandedRows.has(collaborateur.Nom);
                return (
                  <React.Fragment key={collaborateur.Nom}>
                    <tr 
                      className={`hover:bg-slate-100/80 transition-colors cursor-pointer ${
                        hasSubmitted ? 'bg-emerald-50/40' : 'bg-rose-50/40'
                      }`}
                      onClick={() => toggleRowExpand(collaborateur.Nom)}
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {submissions.length > 0 && (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-sky-600" /> : <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <span>{collaborateur.Nom}</span>
                        {collaborateur.Matricule && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{collaborateur.Matricule}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md border text-[11px] font-medium shadow-2xs ${getEntityBadgeColor(collaborateur.Entite)}`}>
                          {collaborateur.Entite}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {collaborateur.Fonction ? (
                          <span className={`px-2 py-0.5 rounded border text-[11px] ${getFonctionBadgeColor(collaborateur.Fonction)}`}>
                            {collaborateur.Fonction}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={collaborateur.Responsable || ''}
                          onChange={(e) => {
                            if (onUpdateResponsable) {
                              onUpdateResponsable(collaborateur.Nom, e.target.value);
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border outline-none cursor-pointer transition-all ${getResponsableSelectStyle(collaborateur.Responsable)}`}
                        >
                          <option value="">⚠️ Non assigné</option>
                          {cdzCdaList.map((resp) => (
                            <option key={resp} value={resp}>
                              👤 {resp}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasSubmitted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Rempli
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Non Rempli
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        <span className={`px-2.5 py-1 rounded-lg text-xs ${
                          submissions.length > 0 
                            ? 'bg-sky-100 text-sky-800 border border-sky-200 font-bold' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {submissions.length} note{submissions.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenEditModal) onOpenEditModal(collaborateur);
                            }}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Modifier ce collaborateur"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenDeleteModal) onOpenDeleteModal(collaborateur);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer ce collaborateur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Submissions Details */}
                    {isExpanded && submissions.length > 0 && (
                      <tr className="bg-slate-100/70 border-b border-slate-200">
                        <td colSpan="7" className="p-4 pl-12">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                            <h4 className="text-xs font-bold text-sky-700 flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                              Détail des notes de frais soumises ({submissions.length})
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[11px] text-slate-700">
                                <thead>
                                  <tr className="text-slate-500 border-b border-slate-200 bg-slate-50">
                                    <th className="py-2 px-3">Référence</th>
                                    <th className="py-2 px-3">Société</th>
                                    <th className="py-2 px-3">Mois / Semaine</th>
                                    <th className="py-2 px-3">Date Création</th>
                                    <th className="py-2 px-3">État Demande</th>
                                    <th className="py-2 px-3 text-right">Document GED</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {submissions.map((sub, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                      <td className="py-2 px-3 font-mono font-bold text-sky-700">
                                        {sub['Référence'] || sub.Reference || 'N/A'}
                                      </td>
                                      <td className="py-2 px-3 text-slate-700">
                                        {sub['Société'] || sub.Societe || '-'}
                                      </td>
                                      <td className="py-2 px-3 text-slate-500">
                                        {sub.Mois} • {sub.Semaine}
                                      </td>
                                      <td className="py-2 px-3 text-slate-500">
                                        {sub['Date de création'] || '-'}
                                      </td>
                                      <td className="py-2 px-3">
                                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-medium">
                                          {sub['Etat de la demande'] || 'N/A'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        {sub['URL du document'] ? (
                                          <a
                                            href={sub['URL du document']}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold underline"
                                          >
                                            <span>Ouvrir</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        ) : (
                                          <span className="text-slate-400">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Affichage de {sortedRows.length} collaborateur(s)</span>
        <span className="flex items-center gap-1 text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" /> Cliquez sur n'importe quelle ligne avec des soumissions pour afficher ses détails
        </span>
      </div>
    </div>
  );
}
