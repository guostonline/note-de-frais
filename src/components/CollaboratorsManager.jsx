import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Edit3, Trash2, ShieldCheck, Search, Filter, 
  Download, FileSpreadsheet, Briefcase, Building2, CheckCircle2, LayoutGrid, List
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getEntityBadgeColor, getFonctionBadgeColor, getResponsableSelectStyle } from '../utils/colors';
import { CdzAvatarBadge } from '../utils/cdzAvatars';

export default function CollaboratorsManager({
  collabList,
  cdzCdaList = [],
  entities = [],
  fonctions = [],
  selectedEntity: propEntity,
  setSelectedEntity: propSetEntity,
  selectedResponsable: propResponsable,
  setSelectedResponsable: propSetResponsable,
  selectedFonction: propFonction,
  setSelectedFonction: propSetFonction,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onUpdateResponsable
}) {
  const [search, setSearch] = useState('');
  const [localEntity, setLocalEntity] = useState('ALL');
  const [localResponsable, setLocalResponsable] = useState('ALL');
  const [localFonction, setLocalFonction] = useState('ALL');
  const [displayMode, setDisplayMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table');

  const selectedEntity = propEntity !== undefined ? propEntity : localEntity;
  const setSelectedEntity = propSetEntity || setLocalEntity;

  const selectedResponsable = propResponsable !== undefined ? propResponsable : localResponsable;
  const setSelectedResponsable = propSetResponsable || setLocalResponsable;

  const selectedFonction = propFonction !== undefined ? propFonction : localFonction;
  const setSelectedFonction = propSetFonction || setLocalFonction;

  // Filtered collaborators list
  const filteredCollabs = useMemo(() => {
    return collabList.filter(c => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchNom = (c.Nom || '').toLowerCase().includes(q);
        const matchMat = String(c.Matricule || '').toLowerCase().includes(q);
        const matchEnt = (c.Entite || '').toLowerCase().includes(q);
        const matchFonct = (c.Fonction || '').toLowerCase().includes(q);
        const matchResp = (c.Responsable || '').toLowerCase().includes(q);
        if (!matchNom && !matchMat && !matchEnt && !matchFonct && !matchResp) return false;
      }
      // Entity filter
      if (Array.isArray(selectedEntity) && selectedEntity.length > 0) {
        if (!selectedEntity.includes(c.Entite)) return false;
      } else if (typeof selectedEntity === 'string' && selectedEntity !== 'ALL') {
        if (c.Entite !== selectedEntity) return false;
      }

      // Responsable filter
      if (Array.isArray(selectedResponsable) && selectedResponsable.length > 0) {
        const includesNone = selectedResponsable.includes('NONE');
        const matchesResponsable = selectedResponsable.includes(c.Responsable);
        const isUnassigned = !c.Responsable;
        if (!(matchesResponsable || (includesNone && isUnassigned))) return false;
      } else if (typeof selectedResponsable === 'string' && selectedResponsable !== 'ALL') {
        if (selectedResponsable === 'NONE' && c.Responsable) return false;
        if (selectedResponsable !== 'NONE' && c.Responsable !== selectedResponsable) return false;
      }

      // Fonction filter
      if (Array.isArray(selectedFonction) && selectedFonction.length > 0) {
        if (!selectedFonction.includes(c.Fonction)) return false;
      } else if (typeof selectedFonction === 'string' && selectedFonction !== 'ALL') {
        if (c.Fonction !== selectedFonction) return false;
      }

      return true;
    });
  }, [collabList, search, selectedEntity, selectedResponsable, selectedFonction]);

  // Statistics
  const totalCount = collabList.length;
  const assignedCount = collabList.filter(c => c.Responsable).length;
  const unassignedCount = totalCount - assignedCount;

  // Export full Collaborateurs list to Excel
  const exportFullListToExcel = () => {
    const dataToExport = filteredCollabs.map((c, index) => ({
      '#': index + 1,
      Matricule: c.Matricule || '',
      Nom: c.Nom || '',
      Entite: c.Entite || '',
      Fonction: c.Fonction || '',
      Responsable_CDZ_CDA: c.Responsable || 'Non assigné'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Collaborateurs");
    XLSX.writeFile(wb, `Liste_Collaborateurs_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card & Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Collaborateurs</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Entités / Services</p>
            <h3 className="text-2xl font-bold text-slate-900">{entities.length}</h3>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assignés CDZ / CDA</p>
            <h3 className="text-2xl font-bold text-slate-900">{assignedCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Non Assignés</p>
            <h3 className="text-2xl font-bold text-slate-900">{unassignedCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Toolbar & Filters */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500 text-white rounded-xl shadow-md shadow-sky-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Répertoire & Édition des Collaborateurs</h2>
                <p className="text-xs text-slate-500">Gérez vos membres, modifiez leurs postes et attribuez leurs responsables CDZ/CDA</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Display mode toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setDisplayMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                    displayMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vue Tableau"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                    displayMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vue Cartes"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportFullListToExcel}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exporter Excel</span>
              </button>

              {/* Add Button */}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nouveau Collaborateur</span>
              </button>
            </div>
          </div>

          {/* Filter Bar Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              />
            </div>

            {/* Entity Filter */}
            <div>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              >
                <option value="ALL">Toutes les Entités ({entities.length})</option>
                {entities.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {/* Responsable CDZ / CDA Filter */}
            <div>
              <select
                value={selectedResponsable}
                onChange={(e) => setSelectedResponsable(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              >
                <option value="ALL">Tous les Responsables CDZ/CDA</option>
                <option value="NONE">-- Non assignés uniquement --</option>
                {cdzCdaList.map(r => (
                  <option key={r} value={r}>👤 {r}</option>
                ))}
              </select>
            </div>

            {/* Fonction Filter */}
            <div>
              <select
                value={selectedFonction}
                onChange={(e) => setSelectedFonction(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              >
                <option value="ALL">Toutes les Fonctions ({fonctions.length})</option>
                {fonctions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content View */}
        {displayMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Collaborateur</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Entité / Service</th>
                  <th className="py-3 px-4">Fonction / Poste</th>
                  <th className="py-3 px-4">Responsable CDZ / CDA</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCollabs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      Aucun collaborateur trouvé pour les filtres actifs.
                    </td>
                  </tr>
                ) : (
                  filteredCollabs.map((collab, index) => (
                    <tr key={collab.Nom} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{collab.Nom}</span>
                          {collab.IgnoredThisMonth && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                              <span>🚫 Ignoré ce mois</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {collab.Matricule ? `#${collab.Matricule}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md border text-[11px] font-medium shadow-2xs ${getEntityBadgeColor(collab.Entite)}`}>
                          {collab.Entite}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] ${getFonctionBadgeColor(collab.Fonction)}`}>
                          {collab.Fonction || 'Non spécifiée'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <CdzAvatarBadge name={collab.Responsable} size="sm" />
                          <select
                            value={collab.Responsable || ''}
                            onChange={(e) => onUpdateResponsable && onUpdateResponsable(collab.Nom, e.target.value)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border outline-none cursor-pointer transition-all ${getResponsableSelectStyle(collab.Responsable)}`}
                          >
                            <option value="">⚠️ Non assigné</option>
                            {cdzCdaList.map(resp => (
                              <option key={resp} value={resp}>
                                {resp}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditModal && onOpenEditModal(collab)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Modifier ce collaborateur"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal && onOpenDeleteModal(collab)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer ce collaborateur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollabs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500">
                Aucun collaborateur trouvé.
              </div>
            ) : (
              filteredCollabs.map(collab => (
                <div key={collab.Nom} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{collab.Nom}</h4>
                      {collab.Matricule && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          #{collab.Matricule}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded border text-[11px] font-medium ${getEntityBadgeColor(collab.Entite)}`}>
                          🏢 {collab.Entite}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded border text-[11px] ${getFonctionBadgeColor(collab.Fonction)}`}>
                          💼 {collab.Fonction || 'Poste non spécifié'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <CdzAvatarBadge name={collab.Responsable} size="xs" />
                      <select
                        value={collab.Responsable || ''}
                        onChange={(e) => onUpdateResponsable && onUpdateResponsable(collab.Nom, e.target.value)}
                        className={`w-full px-2 py-1 text-[10px] font-medium rounded-md border cursor-pointer outline-none ${getResponsableSelectStyle(collab.Responsable)}`}
                      >
                        <option value="">⚠️ Resp. CDZ/CDA non assigné</option>
                        {cdzCdaList.map(resp => (
                          <option key={resp} value={resp}>{resp}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenEditModal && onOpenEditModal(collab)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDeleteModal && onOpenDeleteModal(collab)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Affichage de {filteredCollabs.length} sur {totalCount} collaborateur(s)</span>
          <span>Utilisez les sélecteurs pour attribuer directement les responsables CDZ / CDA</span>
        </div>
      </div>
    </div>
  );
}
