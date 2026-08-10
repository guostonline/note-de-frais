import React from 'react';
import { Search, Calendar, Filter, Grid, Table, BarChart3, X, Users, ShieldCheck, Briefcase } from 'lucide-react';
import MultiSelectDropdown from './MultiSelectDropdown';

export default function FilterBar({
  months,
  weeks,
  entities,
  fonctions = [],
  cdzCdaList = [],
  selectedMonth = [],
  setSelectedMonth,
  selectedWeek = [],
  setSelectedWeek,
  selectedEntity = [],
  setSelectedEntity,
  selectedCdz = [],
  setSelectedCdz,
  selectedFonction = [],
  setSelectedFonction,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode
}) {
  // Normalize string filter states to array if string passed
  const monthArray = Array.isArray(selectedMonth) ? selectedMonth : (selectedMonth === 'ALL' ? [] : [selectedMonth]);
  const weekArray = Array.isArray(selectedWeek) ? selectedWeek : (selectedWeek === 'ALL' ? [] : [selectedWeek]);
  const entityArray = Array.isArray(selectedEntity) ? selectedEntity : (selectedEntity === 'ALL' ? [] : [selectedEntity]);
  const cdzArray = Array.isArray(selectedCdz) ? selectedCdz : (selectedCdz === 'ALL' ? [] : [selectedCdz]);
  const fonctionArray = Array.isArray(selectedFonction) ? selectedFonction : (selectedFonction === 'ALL' ? [] : [selectedFonction]);

  return (
    <div className="glass-panel p-5 rounded-3xl mb-8 space-y-4 shadow-sm">
      {/* Top row: View switcher & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Crextio View Mode Pill Tabs */}
        <div className="flex items-center gap-1.5 bg-[#EFE8D6]/60 p-1.5 rounded-full border border-stone-200/80 self-start md:self-auto flex-wrap shadow-inner">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all ${
              viewMode === 'table'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tableau Comparatif</span>
          </button>

          <button
            onClick={() => setViewMode('collaborateurs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all ${
              viewMode === 'collaborateurs'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion Collaborateurs</span>
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all ${
              viewMode === 'matrix'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Matrice par Semaine</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all ${
              viewMode === 'analytics'
                ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Graphiques & Analyses</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par Nom, Matricule, Fonction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200/80 focus:border-[#EBC046] rounded-full pl-11 pr-10 py-2.5 text-xs text-[#1E2024] placeholder-stone-400 outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Multi-Select Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200/80">
        {/* Month Multi-Select */}
        <MultiSelectDropdown
          label="Mois"
          icon={Calendar}
          colorClass="text-sky-500"
          placeholder="Tous les Mois"
          options={months}
          selectedValues={monthArray}
          onChange={(newVal) => setSelectedMonth(newVal)}
        />

        {/* Week Multi-Select */}
        <MultiSelectDropdown
          label="Semaine"
          icon={Calendar}
          colorClass="text-indigo-500"
          placeholder="Toutes les Semaines"
          options={weeks}
          selectedValues={weekArray}
          onChange={(newVal) => setSelectedWeek(newVal)}
        />

        {/* Entity Multi-Select */}
        <MultiSelectDropdown
          label="Entité / Service"
          icon={Filter}
          colorClass="text-emerald-500"
          placeholder="Toutes les Entités"
          options={entities}
          selectedValues={entityArray}
          onChange={(newVal) => setSelectedEntity(newVal)}
        />

        {/* CDZ / CDA Multi-Select */}
        <MultiSelectDropdown
          label="Responsable CDZ/CDA"
          icon={ShieldCheck}
          colorClass="text-amber-500"
          placeholder="Tous les CDZ / CDA"
          options={[
            { label: '-- Non assignés --', value: 'NONE' },
            ...cdzCdaList.map(r => ({ label: `👤 ${r}`, value: r }))
          ]}
          selectedValues={cdzArray}
          onChange={(newVal) => setSelectedCdz && setSelectedCdz(newVal)}
        />

        {/* Fonction Multi-Select */}
        <MultiSelectDropdown
          label="Fonction / Poste"
          icon={Briefcase}
          colorClass="text-purple-500"
          placeholder="Toutes les Fonctions"
          options={fonctions}
          selectedValues={fonctionArray}
          onChange={(newVal) => setSelectedFonction && setSelectedFonction(newVal)}
        />
      </div>
    </div>
  );
}
