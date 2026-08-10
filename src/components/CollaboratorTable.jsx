import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronRight, ExternalLink, 
  Mail, Download, Copy, Check, Info, FileSpreadsheet,
  UserPlus, Edit3, Trash2, MessageSquare
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getEntityBadgeColor, getFonctionBadgeColor, getResponsableSelectStyle } from '../utils/colors';
import CdzReminderModal from './CdzReminderModal';

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
  const [isCdzModalOpen, setIsCdzModalOpen] = useState(false);
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
    <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-stone-200/80">
      {/* Header Tabs & Actions Toolbar */}
      <div className="p-5 border-b border-stone-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Crextio Pill Tabs */}
        <div className="flex items-center gap-1.5 bg-[#EFE8D6]/60 p-1.5 rounded-full border border-stone-200/80 self-start xl:self-auto flex-wrap shadow-inner">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <span>Tous les Collaborateurs</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'ALL' ? 'bg-[#F3CF55] text-[#1E2024]' : 'bg-stone-200 text-stone-700'}`}>
              {allCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SUBMITTED')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'SUBMITTED'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'SUBMITTED' ? 'text-[#F3CF55]' : 'text-emerald-600'}`} />
            <span>Ont Rempli</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'SUBMITTED' ? 'bg-[#F3CF55] text-[#1E2024]' : 'bg-emerald-100 text-emerald-800'}`}>
              {submittedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MISSING')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'MISSING'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <XCircle className={`w-3.5 h-3.5 ${activeTab === 'MISSING' ? 'text-rose-400' : 'text-rose-600'}`} />
            <span>Non Remplis (En Retard)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'MISSING' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'}`}>
              {missingCount}
            </span>
          </button>
        </div>

        {/* Crextio Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Collaborator Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1E2024] bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full transition-all shadow-xs"
            title="Ajouter un nouveau collaborateur"
          >
            <UserPlus className="w-4 h-4 text-[#22252A]" />
            <span>+ Collaborateur</span>
          </button>

          {missingCount > 0 && (
            <>
              {/* Relancer CDZ (WhatsApp & Email) Button */}
              <button
                onClick={() => setIsCdzModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-md shadow-emerald-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                title="Envoyer la liste des retardataires à un CDZ spécifique via WhatsApp ou Email"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Relancer CDZ (WhatsApp & Email)</span>
              </button>

              <button
                onClick={copyEmailReminder}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1E2024] bg-[#F3CF55] hover:bg-[#EBC046] rounded-full shadow-md shadow-[#F3CF55]/20 transition-all cursor-pointer"
                title="Copier un modèle d'email de relance pour les retardataires"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-[#1E2024]" /> : <Mail className="w-4 h-4 text-[#1E2024]" />}
                <span>{copiedEmail ? 'Email Copié !' : 'Relance Rapide'}</span>
              </button>

              <button
                onClick={exportMissingToExcel}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full transition-all shadow-xs"
                title="Télécharger la liste Excel des retardataires"
              >
                <Download className="w-4 h-4 text-emerald-600" />
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

      {/* CDZ WhatsApp & Email Reminder Modal */}
      <CdzReminderModal
        isOpen={isCdzModalOpen}
        onClose={() => setIsCdzModalOpen(false)}
        rows={rows}
        cdzCdaList={cdzCdaList}
        monthFilter={monthFilter}
        weekFilter={weekFilter}
      />
    </div>
  );
}
