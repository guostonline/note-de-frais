import React, { useState } from 'react';
import { Search, Calendar, Filter, Grid, Table, BarChart3, X, Users, ShieldCheck, Briefcase, SlidersHorizontal } from 'lucide-react';
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Normalize string filter states to array
  const monthArray   = Array.isArray(selectedMonth)   ? selectedMonth   : (selectedMonth   === 'ALL' ? [] : [selectedMonth]);
  const weekArray    = Array.isArray(selectedWeek)    ? selectedWeek    : (selectedWeek    === 'ALL' ? [] : [selectedWeek]);
  const entityArray  = Array.isArray(selectedEntity)  ? selectedEntity  : (selectedEntity  === 'ALL' ? [] : [selectedEntity]);
  const cdzArray     = Array.isArray(selectedCdz)     ? selectedCdz     : (selectedCdz     === 'ALL' ? [] : [selectedCdz]);
  const fonctionArray= Array.isArray(selectedFonction)? selectedFonction: (selectedFonction=== 'ALL' ? [] : [selectedFonction]);

  // Count active filters for badge on mobile toggle
  const activeFilterCount = [
    monthArray.length    > 0 ? 1 : 0,
    weekArray.length     > 0 ? 1 : 0,
    entityArray.length   > 0 ? 1 : 0,
    cdzArray.length      > 0 ? 1 : 0,
    fonctionArray.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const tabs = [
    { id: 'table',          Icon: Table,    labelShort: 'Tableau',      labelFull: 'Tableau Comparatif' },
    { id: 'collaborateurs', Icon: Users,    labelShort: 'Collabs',      labelFull: 'Gestion Collaborateurs' },
    { id: 'matrix',         Icon: Grid,     labelShort: 'Matrice',      labelFull: 'Matrice par Semaine' },
    { id: 'analytics',      Icon: BarChart3,labelShort: 'Graphiques',   labelFull: 'Graphiques & Analyses' },
  ];

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl mb-5 sm:mb-8 shadow-sm space-y-3">

      {/* ── Row 1: Tabs (scrollable) + Search (inline on sm+) ── */}
      <div className="flex items-center gap-3">
        {/* Horizontally scrollable tab strip */}
        <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
          <div className="flex items-center gap-1.5 bg-[#EFE8D6]/60 p-1.5 rounded-full border border-stone-200/80 shadow-inner w-max">
            {tabs.map(({ id, Icon, labelShort, labelFull }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  viewMode === id
                    ? 'bg-[#22252A] text-white shadow-md shadow-[#22252A]/15'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE8D6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="sm:hidden">{labelShort}</span>
                <span className="hidden sm:inline">{labelFull}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search — visible on sm+ in this row */}
        <div className="relative hidden sm:block flex-shrink-0 w-56 lg:w-72">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher nom, matricule..."
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

      {/* ── Row 2 (mobile only): Search + Filter toggle ── */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher nom, matricule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200/80 focus:border-[#EBC046] rounded-full pl-10 pr-9 py-2.5 text-xs text-[#1E2024] placeholder-stone-400 outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setFiltersOpen(prev => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border transition-all shrink-0 ${
            filtersOpen || activeFilterCount > 0
              ? 'bg-[#22252A] text-white border-[#22252A]'
              : 'bg-white text-stone-700 border-stone-200/80 hover:bg-stone-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtres</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F3CF55] text-[#1E2024]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter dropdowns: always on sm+, collapsible on mobile ── */}
      <div className={`${filtersOpen ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200/80`}>
        <MultiSelectDropdown
          label="Mois"
          icon={Calendar}
          colorClass="text-sky-500"
          placeholder="Tous les Mois"
          options={months}
          selectedValues={monthArray}
          onChange={(newVal) => setSelectedMonth(newVal)}
        />

        <MultiSelectDropdown
          label="Semaine"
          icon={Calendar}
          colorClass="text-indigo-500"
          placeholder="Toutes les Semaines"
          options={weeks}
          selectedValues={weekArray}
          onChange={(newVal) => setSelectedWeek(newVal)}
        />

        <MultiSelectDropdown
          label="Entité / Service"
          icon={Filter}
          colorClass="text-emerald-500"
          placeholder="Toutes les Entités"
          options={entities}
          selectedValues={entityArray}
          onChange={(newVal) => setSelectedEntity(newVal)}
        />

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
