import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import FilterBar from './components/FilterBar';
import CollaboratorTable from './components/CollaboratorTable';
import HeatmapMatrix from './components/HeatmapMatrix';
import AnalyticsCharts from './components/AnalyticsCharts';
import UploadModal from './components/UploadModal';
import AliasMapperModal from './components/AliasMapperModal';
import CollaboratorsManager from './components/CollaboratorsManager';
import CollaboratorModal from './components/CollaboratorModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import LoginModal from './components/LoginModal';
import { CheckCircle2 } from 'lucide-react';

import { initialCollaborateurs, initialFrais } from './data/defaultData';
import { 
  buildSubmissionMap, 
  getUniqueMonths, 
  getUniqueWeeks, 
  getUniqueEntities,
  getUniqueFonctions,
  getUniqueCdzCda
} from './utils/matching';

import { 
  db,
  seedDatabaseIfEmpty, 
  dbGetAllCollaborateurs, 
  dbSaveCollaborateur, 
  dbDeleteCollaborateur, 
  dbGetAllFrais, 
  dbSaveFraisBatch, 
  dbGetAliasMap, 
  dbSaveAliasMap, 
  dbResetToDefaults 
} from './data/db';

const defaultAliasMap = {
  "CHAKIB ELFIL": "CHAKIB EL FIL",
  "BOUTMEZGUINE EL MOSTAFA": "EL MOSTAFA BOUTMEZGUINE",
  "NOUREDDINE BEN SALEM": "BENSALEM NOUREDDINE",
  "EL HACHEM BENGAIOU": "EL GHANMI MOHAMED"
};

export default function App() {
  // Ensure dark class is removed from html root element
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  // State for dataset (Synchronous LocalStorage fallback + IndexedDB async sync)
  const [collabList, setCollabList] = useState(() => {
    try {
      const saved = localStorage.getItem('ndf_collab_list');
      return saved ? JSON.parse(saved) : initialCollaborateurs;
    } catch (e) {
      return initialCollaborateurs;
    }
  });
  const [fraisList, setFraisList] = useState(initialFrais);
  const [aliasMap, setAliasMap] = useState(defaultAliasMap);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ndf_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoginOpen, setIsLoginOpen] = useState(() => !localStorage.getItem('ndf_current_user'));

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('ndf_current_user', JSON.stringify(user));
    } catch (e) {}
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ndf_current_user');
    setIsLoginOpen(true);
  };

  // Initialize and seed fast IndexedDB database on app start
  useEffect(() => {
    async function initDb() {
      await seedDatabaseIfEmpty(initialCollaborateurs, initialFrais, defaultAliasMap);
      const dbCollabs = await dbGetAllCollaborateurs();
      const dbFrais = await dbGetAllFrais();
      const dbAliases = await dbGetAliasMap();

      if (dbCollabs && dbCollabs.length > 0) setCollabList(dbCollabs);
      if (dbFrais && dbFrais.length > 0) setFraisList(dbFrais);
      if (dbAliases && Object.keys(dbAliases).length > 0) setAliasMap(dbAliases);
      setIsDbLoaded(true);
    }
    initDb();
  }, []);

  // Filtering states
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedCdz, setSelectedCdz] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'collaborateurs', 'matrix', 'analytics'

  // Derived options lists
  const months = useMemo(() => getUniqueMonths(fraisList), [fraisList]);
  const weeks = useMemo(() => getUniqueWeeks(fraisList, selectedMonth), [fraisList, selectedMonth]);
  const entities = useMemo(() => getUniqueEntities(collabList), [collabList]);
  const fonctions = useMemo(() => getUniqueFonctions(collabList), [collabList]);
  const cdzCdaList = useMemo(() => getUniqueCdzCda(collabList), [collabList]);

  // Default functions selection: ALL EXCEPT 'aide livreur'
  const defaultFonctions = useMemo(() => {
    return fonctions.filter(f => !f.toLowerCase().includes('aide livreur'));
  }, [fonctions]);

  const [selectedFonctionState, setSelectedFonctionState] = useState(null);

  const activeSelectedFonction = selectedFonctionState !== null ? selectedFonctionState : defaultFonctions;
  const setSelectedFonction = (val) => setSelectedFonctionState(val);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAliasMapperOpen, setIsAliasMapperOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collaboratorToEdit, setCollaboratorToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState(null);

  // Calculate submission map for current period filter
  const { map: submissionMap, filteredFraisCount } = useMemo(() => {
    return buildSubmissionMap(collabList, fraisList, selectedMonth, selectedWeek, aliasMap);
  }, [collabList, fraisList, selectedMonth, selectedWeek, aliasMap]);

  // Counts
  const totalCollab = collabList.length;
  const totalFrais = fraisList.length;

  let submittedCount = 0;
  Object.values(submissionMap).forEach(item => {
    if (item.hasSubmitted) submittedCount += 1;
  });
  const missingCount = totalCollab - submittedCount;

  // Toast Notification State
  const [showSaveToast, setShowSaveToast] = useState(false);

  const notifyAutoSave = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  // Handle uploaded new Excel files
  const handleDataUploaded = async ({ newCollab, newFrais }) => {
    if (newCollab && newCollab.length > 0) {
      setCollabList(newCollab);
      await db.collaborateurs.clear();
      await db.collaborateurs.bulkPut(newCollab);
    }
    if (newFrais && newFrais.length > 0) {
      setFraisList(newFrais);
      await dbSaveFraisBatch(newFrais);
    }
    notifyAutoSave();
  };

  // Reset to initial files
  const handleResetData = async () => {
    if (window.confirm("Voulez-vous réinitialiser la base de données vers les fichiers originaux ?")) {
      await dbResetToDefaults(initialCollaborateurs, initialFrais, defaultAliasMap);
      setCollabList(initialCollaborateurs);
      setFraisList(initialFrais);
      setAliasMap(defaultAliasMap);
      setSelectedMonth('ALL');
      setSelectedWeek('ALL');
      setSelectedEntity('ALL');
      setSearchQuery('');
      notifyAutoSave();
    }
  };

  // Save alias map changes
  const handleSaveAliasMap = async (newMap) => {
    setAliasMap(newMap);
    await dbSaveAliasMap(newMap);
    notifyAutoSave();
  };

  // CRUD Collaborateurs Handlers with IndexedDB persistence
  const handleOpenAddCollab = () => {
    setCollaboratorToEdit(null);
    setIsCollabModalOpen(true);
  };

  const handleOpenEditCollab = (collab) => {
    setCollaboratorToEdit(collab);
    setIsCollabModalOpen(true);
  };

  const handleOpenDeleteCollab = (collab) => {
    setCollaboratorToDelete(collab);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCollaborator = async ({ originalNom, collaborator }) => {
    if (originalNom) {
      if (originalNom !== collaborator.Nom) {
        await dbDeleteCollaborateur(originalNom);
      }
      setCollabList(prev => prev.map(c => c.Nom === originalNom ? { ...c, ...collaborator } : c));
    } else {
      setCollabList(prev => [collaborator, ...prev]);
    }
    await dbSaveCollaborateur(collaborator);
    notifyAutoSave();
  };

  // Auto-sync collabList to LocalStorage & IndexedDB whenever collabList changes
  useEffect(() => {
    if (!isDbLoaded || !collabList || collabList.length === 0) return;
    try {
      localStorage.setItem('ndf_collab_list', JSON.stringify(collabList));
      dbSaveCollaborateursBatch(collabList);
    } catch (e) {}
  }, [collabList, isDbLoaded]);

  const handleUpdateResponsable = async (collabNom, newResponsable) => {
    const target = collabList.find(c => c.Nom === collabNom);
    if (!target) return;

    const updatedCollab = { ...target, Responsable: newResponsable };

    // Update React state
    const nextList = collabList.map(c => c.Nom === collabNom ? updatedCollab : c);
    setCollabList(nextList);

    // Save synchronously to LocalStorage
    try {
      localStorage.setItem('ndf_collab_list', JSON.stringify(nextList));
    } catch (e) {}

    // Save to IndexedDB
    await dbSaveCollaborateur(updatedCollab);
    notifyAutoSave();
  };

  const handleConfirmDeleteCollaborator = async () => {
    if (!collaboratorToDelete) return;
    const nextList = collabList.filter(c => c.Nom !== collaboratorToDelete.Nom);
    setCollabList(nextList);
    try {
      localStorage.setItem('ndf_collab_list', JSON.stringify(nextList));
    } catch (e) {}
    await dbDeleteCollaborateur(collaboratorToDelete.Nom);
    setIsDeleteModalOpen(false);
    setCollaboratorToDelete(null);
    notifyAutoSave();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header Bar */}
      <Header
        totalCollab={totalCollab}
        totalFrais={totalFrais}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAliasMapper={() => setIsAliasMapperOpen(true)}
        onResetData={handleResetData}
        onOpenAddCollab={handleOpenAddCollab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* KPI Metric Summary Cards */}
        <KpiCards
          totalCollab={totalCollab}
          submittedCount={submittedCount}
          missingCount={missingCount}
          totalSubmissionsInPeriod={filteredFraisCount}
          monthFilter={selectedMonth}
          weekFilter={selectedWeek}
        />

        {/* Global Filter Toolbar */}
        <FilterBar
          months={months}
          weeks={weeks}
          entities={entities}
          fonctions={fonctions}
          cdzCdaList={cdzCdaList}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          selectedEntity={selectedEntity}
          setSelectedEntity={setSelectedEntity}
          selectedCdz={selectedCdz}
          setSelectedCdz={setSelectedCdz}
          selectedFonction={activeSelectedFonction}
          setSelectedFonction={setSelectedFonction}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {viewMode === 'table' && (
          <CollaboratorTable
            submissionMap={submissionMap}
            collabList={collabList}
            searchQuery={searchQuery}
            selectedEntity={selectedEntity}
            selectedCdz={selectedCdz}
            selectedFonction={activeSelectedFonction}
            monthFilter={selectedMonth}
            weekFilter={selectedWeek}
            cdzCdaList={cdzCdaList}
            onOpenAddModal={handleOpenAddCollab}
            onOpenEditModal={handleOpenEditCollab}
            onOpenDeleteModal={handleOpenDeleteCollab}
            onUpdateResponsable={handleUpdateResponsable}
          />
        )}

        {viewMode === 'collaborateurs' && (
          <CollaboratorsManager
            collabList={collabList}
            cdzCdaList={cdzCdaList}
            entities={entities}
            fonctions={fonctions}
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
            selectedResponsable={selectedCdz}
            setSelectedResponsable={setSelectedCdz}
            selectedFonction={activeSelectedFonction}
            setSelectedFonction={setSelectedFonction}
            onOpenAddModal={handleOpenAddCollab}
            onOpenEditModal={handleOpenEditCollab}
            onOpenDeleteModal={handleOpenDeleteCollab}
            onUpdateResponsable={handleUpdateResponsable}
          />
        )}

        {viewMode === 'matrix' && (
          <HeatmapMatrix
            collabList={collabList}
            fraisList={fraisList}
            monthFilter={selectedMonth}
            selectedEntity={selectedEntity}
            searchQuery={searchQuery}
            aliasMap={aliasMap}
          />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsCharts
            collabList={collabList}
            fraisList={fraisList}
            submissionMap={submissionMap}
            monthFilter={selectedMonth}
            aliasMap={aliasMap}
          />
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataUploaded={handleDataUploaded}
      />

      <AliasMapperModal
        isOpen={isAliasMapperOpen}
        onClose={() => setIsAliasMapperOpen(false)}
        fraisList={fraisList}
        collabList={collabList}
        aliasMap={aliasMap}
        onSaveAliases={handleSaveAliasMap}
      />

      <CollaboratorModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        onSave={handleSaveCollaborator}
        collaboratorToEdit={collaboratorToEdit}
        existingEntities={entities}
        existingFonctions={fonctions}
        cdzCdaList={cdzCdaList}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteCollaborator}
        collaboratorName={collaboratorToDelete?.Nom}
      />

      {/* Auto-Save Toast Notification */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-fade-in text-xs font-semibold">
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>Modification enregistrée en base de données</span>
        </div>
      )}
    </div>
  );
}
