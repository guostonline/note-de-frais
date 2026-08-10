import React from 'react';
import { 
  X, Search, Calendar, Filter, Grid, Table, BarChart3, 
  Users, ShieldCheck, Briefcase, RefreshCw, ChevronRight, SlidersHorizontal 
} from 'lucide-react';
import MultiSelectDropdown from './MultiSelectDropdown';

export default function RightSidebar({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

  // Normalize string filter states to array if string passed
  const monthArray = Array.isArray(selectedMonth) ? selectedMonth : (selectedMonth === 'ALL' ? [] : [selectedMonth]);
  const weekArray = Array.isArray(selectedWeek) ? selectedWeek : (selectedWeek === 'ALL' ? [] : [selectedWeek]);
  const entityArray = Array.isArray(selectedEntity) ? selectedEntity : (selectedEntity === 'ALL' ? [] : [selectedEntity]);
  const cdzArray = Array.isArray(selectedCdz) ? selectedCdz : (selectedCdz === 'ALL' ? [] : [selectedCdz]);
  const fonctionArray = Array.isArray(selectedFonction) ? selectedFonction : (selectedFonction === 'ALL' ? [] : [selectedFonction]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedMonth([]);
    setSelectedWeek([]);
    setSelectedEntity([]);
    setSelectedCdz([]);
    setSelectedFonction([]);
    setSearchQuery('');
  };

  return (
    <>
      {/* Backdrop for mobile & desktop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Right Sidebar Drawer */}
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-[#F8F6EE] border-l border-stone-200/80 shadow-2xl flex flex-col transition-transform animate-slide-in-right">
        {/* Header */}
        <div className="p-5 bg-[#22252A] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F3CF55] text-[#1E2024] rounded-xl shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">Filtres & Navigation</h3>
              <p className="text-[11px] text-stone-300 font-light">Personnalisez votre vue et affinez les données</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1E2024] uppercase tracking-wider">
              Recherche rapide :
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou matricule..."
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:border-[#EBC046] shadow-2xs font-medium text-[#1E2024]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode Navigation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1E2024] uppercase tracking-wider">
              Vue Principale :
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 p-3 text-xs font-bold rounded-2xl border transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#22252A] text-white border-[#22252A] shadow-md shadow-[#22252A]/15'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Table className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#F3CF55]' : 'text-stone-500'}`} />
                <span>Tableau</span>
              </button>

              <button
                onClick={() => setViewMode('collaborateurs')}
                className={`flex items-center gap-2 p-3 text-xs font-bold rounded-2xl border transition-all ${
                  viewMode === 'collaborateurs'
                    ? 'bg-[#22252A] text-white border-[#22252A] shadow-md shadow-[#22252A]/15'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Users className={`w-4 h-4 ${viewMode === 'collaborateurs' ? 'text-[#F3CF55]' : 'text-stone-500'}`} />
                <span>Collaborateurs</span>
              </button>

              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-2 p-3 text-xs font-bold rounded-2xl border transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-[#22252A] text-white border-[#22252A] shadow-md shadow-[#22252A]/15'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Grid className={`w-4 h-4 ${viewMode === 'matrix' ? 'text-[#F3CF55]' : 'text-stone-500'}`} />
                <span>Matrice Hebdo</span>
              </button>

              <button
                onClick={() => setViewMode('analytics')}
                className={`flex items-center gap-2 p-3 text-xs font-bold rounded-2xl border transition-all ${
                  viewMode === 'analytics'
                    ? 'bg-[#22252A] text-white border-[#22252A] shadow-md shadow-[#22252A]/15'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${viewMode === 'analytics' ? 'text-[#F3CF55]' : 'text-stone-500'}`} />
                <span>Graphiques</span>
              </button>
            </div>
          </div>

          <hr className="border-stone-200/80" />

          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1E2024] uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#EBC046]" />
                <span>Filtres Avancés :</span>
              </label>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Mois */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase">1. Période - Mois :</span>
              <MultiSelectDropdown
                label="Sélectionner les Mois"
                options={months}
                selectedValues={monthArray}
                onChange={setSelectedMonth}
                icon={Calendar}
                allLabel="Tous les Mois"
              />
            </div>

            {/* Semaine */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase">2. Période - Semaine :</span>
              <MultiSelectDropdown
                label="Sélectionner les Semaines"
                options={weeks}
                selectedValues={weekArray}
                onChange={setSelectedWeek}
                icon={Calendar}
                allLabel="Toutes les Semaines"
              />
            </div>

            {/* CDZ Responsable */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase">3. Responsable CDZ / CDA :</span>
              <MultiSelectDropdown
                label="Sélectionner les Responsables CDZ"
                options={cdzCdaList}
                selectedValues={cdzArray}
                onChange={setSelectedCdz}
                icon={ShieldCheck}
                allLabel="Tous les Responsables CDZ"
              />
            </div>

            {/* Fonction / Poste */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase">4. Fonction / Poste :</span>
              <MultiSelectDropdown
                label="Sélectionner les Fonctions"
                options={fonctions}
                selectedValues={fonctionArray}
                onChange={setSelectedFonction}
                icon={Briefcase}
                allLabel="Toutes les Fonctions"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200/80 shrink-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-white bg-[#22252A] hover:bg-stone-800 rounded-full shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Appliquer & Fermer</span>
            <ChevronRight className="w-4 h-4 text-[#F3CF55]" />
          </button>
        </div>
      </aside>
    </>
  );
}
