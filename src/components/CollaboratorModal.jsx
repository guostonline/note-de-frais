import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';

export default function CollaboratorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  collaboratorToEdit = null,
  existingEntities = [],
  existingFonctions = [],
  cdzCdaList = []
}) {
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [entite, setEntite] = useState('');
  const [customEntite, setCustomEntite] = useState('');
  const [fonction, setFonction] = useState('');
  const [customFonction, setCustomFonction] = useState('');
  const [responsable, setResponsable] = useState('');
  const [error, setError] = useState('');

  const isEditMode = !!collaboratorToEdit;

  useEffect(() => {
    if (collaboratorToEdit) {
      setNom(collaboratorToEdit.Nom || '');
      setMatricule(collaboratorToEdit.Matricule || '');
      
      // Entite setup
      if (existingEntities.includes(collaboratorToEdit.Entite)) {
        setEntite(collaboratorToEdit.Entite);
        setCustomEntite('');
      } else {
        setEntite('NEW');
        setCustomEntite(collaboratorToEdit.Entite || '');
      }

      // Fonction setup
      const currentFonct = (collaboratorToEdit.Fonction || '').trim();
      if (!currentFonct) {
        setFonction('');
        setCustomFonction('');
      } else if (existingFonctions.includes(currentFonct.toUpperCase())) {
        setFonction(currentFonct.toUpperCase());
        setCustomFonction('');
      } else {
        setFonction('NEW');
        setCustomFonction(currentFonct);
      }

      // Responsable CDZ / CDA setup
      setResponsable(collaboratorToEdit.Responsable || collaboratorToEdit['Responsable CDZ/CDA'] || '');
    } else {
      setNom('');
      setMatricule('');
      setEntite(existingEntities[0] || '');
      setCustomEntite('');
      setFonction('');
      setCustomFonction('');
      setResponsable('');
    }
    setError('');
  }, [collaboratorToEdit, isOpen, existingEntities, existingFonctions]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedNom = nom.trim().toUpperCase();
    if (!trimmedNom) {
      setError('Le nom du collaborateur est obligatoire.');
      return;
    }

    const finalEntite = entite === 'NEW' ? customEntite.trim() : entite;
    if (!finalEntite) {
      setError('L\'entité / service est obligatoire.');
      return;
    }

    const finalFonction = fonction === 'NEW' ? customFonction.trim() : fonction;

    onSave({
      originalNom: collaboratorToEdit ? collaboratorToEdit.Nom : null,
      collaborator: {
        Nom: trimmedNom,
        Matricule: matricule ? (isNaN(matricule) ? matricule : Number(matricule)) : '',
        Entite: finalEntite,
        Fonction: finalFonction,
        Responsable: responsable
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform transition-all">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 rounded-xl border border-sky-400/30">
              {isEditMode ? (
                <UserCheck className="w-5 h-5 text-sky-400" />
              ) : (
                <UserPlus className="w-5 h-5 text-sky-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                {isEditMode ? 'Modifier Collaborateur' : 'Nouveau Collaborateur'}
              </h3>
              <p className="text-xs text-slate-300 font-light">
                {isEditMode ? 'Mettre à jour les informations' : 'Ajouter un nouveau membre à la liste'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nom & Prénom */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: BENANI MOHAMED"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all uppercase"
              required
            />
          </div>

          {/* Matricule */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Matricule (Optionnel)
            </label>
            <input
              type="text"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="ex: 105420"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* Responsable CDZ / CDA */}
          <div className="p-3.5 bg-sky-50/50 border border-sky-100 rounded-xl space-y-1.5">
            <label className="block text-xs font-bold text-sky-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Responsable CDZ / CDA</span>
            </label>
            <select
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white font-medium text-slate-800"
            >
              <option value="">-- Aucun Responsable assigné --</option>
              {cdzCdaList.map((resp) => (
                <option key={resp} value={resp}>
                  👤 {resp}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-sky-700 font-normal">
              Sélectionnez le Responsable CDZ ou CDA qui supervise ce collaborateur.
            </p>
          </div>

          {/* Entité */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Entité / Service <span className="text-rose-500">*</span>
            </label>
            <select
              value={entite}
              onChange={(e) => setEntite(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
            >
              {existingEntities.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
              <option value="NEW">+ Ajouter une nouvelle entité...</option>
            </select>
          </div>

          {/* Custom Entité input if "NEW" selected */}
          {entite === 'NEW' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom de la nouvelle Entité <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customEntite}
                onChange={(e) => setCustomEntite(e.target.value)}
                placeholder="ex: Direction Générale Casablanca"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          {/* Fonction */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fonction / Poste (Optionnel)
            </label>
            <select
              value={fonction}
              onChange={(e) => setFonction(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">-- Non spécifiée --</option>
              {existingFonctions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
              <option value="NEW">+ Autre fonction (Saisie libre)...</option>
            </select>
          </div>

          {/* Custom Fonction input if "NEW" selected */}
          {fonction === 'NEW' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intitulé de la fonction
              </label>
              <input
                type="text"
                value={customFonction}
                onChange={(e) => setCustomFonction(e.target.value)}
                placeholder="ex: RESPONSABLE LOGISTIQUE"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all uppercase"
              />
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-md shadow-sky-500/20 transition-all"
            >
              {isEditMode ? 'Enregistrer les modifications' : 'Ajouter le collaborateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
