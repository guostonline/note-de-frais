import React, { useState, useMemo } from 'react';
import { X, Send, Mail, Copy, Check, ShieldCheck, Users, AlertCircle, MessageSquare } from 'lucide-react';

const CDZ_EMAILS = {
  'CHAKIB EL FIL': 'c.elfil@madec.co.ma',
  'EL BESTIRI SOUFIANE': 's.elbestiri@madec.co.ma',
  'EL MOSTAFA BOUTMEZGUINE': 'm.boutmezguine@madec.co.ma',
  'MOHAMMED MAAIZ': 'm.maaiz@madec.co.ma',
  'BENSALEM NOUREDDINE': 'n.bensalem@madec.co.ma'
};

export default function CdzReminderModal({
  isOpen,
  onClose,
  rows = [],
  cdzCdaList = [],
  monthFilter = 'ALL',
  weekFilter = 'ALL'
}) {
  const [selectedCdz, setSelectedCdz] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Filter missing rows (hasSubmitted === false)
  const missingRows = useMemo(() => {
    return (rows || []).filter(r => !r.hasSubmitted);
  }, [rows]);

  // Filter missing rows for selected CDZ
  const filteredMissingRows = useMemo(() => {
    if (selectedCdz === 'ALL') return missingRows;
    if (selectedCdz === 'NONE') return missingRows.filter(r => !r.collaborateur.Responsable);
    return missingRows.filter(r => r.collaborateur.Responsable === selectedCdz);
  }, [missingRows, selectedCdz]);

  if (!isOpen) return null;

  // Format Period String
  const periodStr = `${monthFilter === 'ALL' || !monthFilter.length ? 'Tous les mois' : Array.isArray(monthFilter) ? monthFilter.join(', ') : monthFilter} ${weekFilter === 'ALL' || !weekFilter.length ? '' : `(${Array.isArray(weekFilter) ? weekFilter.join(', ') : weekFilter})`}`;

  // Generate Message Text for WhatsApp / Email / Copy
  const generateMessageText = (isWhatsApp = false) => {
    const bold = (txt) => isWhatsApp ? `*${txt}*` : txt;
    const header = isWhatsApp 
      ? `🚨 ${bold('RAPPEL NOTE DE FRAIS - MADEC')}\n`
      : `RAPPEL NOTE DE FRAIS - MADEC\n`;

    const cdzText = selectedCdz === 'ALL' 
      ? 'Tous les CDZ / CDA' 
      : (selectedCdz === 'NONE' ? 'Non assignés' : selectedCdz);

    let text = `${header}`;
    text += `👤 ${bold('Responsable CDZ/CDA')} : ${cdzText}\n`;
    text += `📅 ${bold('Période')} : ${periodStr}\n`;
    text += `⚠️ ${bold('Retardataires')} : ${filteredMissingRows.length} collaborateur(s)\n\n`;
    text += `📋 ${bold('Liste des collaborateurs non remplis')} :\n`;

    if (filteredMissingRows.length === 0) {
      text += `✅ Aucun retardataire pour ce CDZ !\n`;
    } else {
      filteredMissingRows.forEach((r, i) => {
        const mat = r.collaborateur.Matricule ? ` (#${r.collaborateur.Matricule})` : '';
        const fonction = r.collaborateur.Fonction ? ` - ${r.collaborateur.Fonction}` : '';
        const entite = r.collaborateur.Entite ? ` [${r.collaborateur.Entite}]` : '';
        text += `${i + 1}. ${bold(r.collaborateur.Nom)}${mat}${fonction}${entite}\n`;
      });
    }

    text += `\nMerci de régulariser la situation dans les meilleurs délais.`;
    return text;
  };

  const handleSendWhatsApp = () => {
    const text = generateMessageText(true);
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleSendEmail = () => {
    const text = generateMessageText(false);
    const targetEmail = CDZ_EMAILS[selectedCdz] || '';
    const subject = encodeURIComponent(`[Rappel] Notes de Frais en retard - ${selectedCdz === 'ALL' ? 'Tous CDZ' : selectedCdz}`);
    const body = encodeURIComponent(text);

    window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyMessage = () => {
    const text = generateMessageText(false);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-stone-200/80 shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="p-3 bg-[#22252A] text-[#F3CF55] rounded-2xl shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1E2024]">Relance CDZ / CDA (WhatsApp & Email)</h3>
            <p className="text-xs text-stone-500 font-medium">
              Envoyez la liste des collaborateurs en retard directement au responsable CDZ concerné
            </p>
          </div>
        </div>

        {/* Selector & Filter Controls */}
        <div className="p-4 bg-[#F6F4EB] rounded-2xl border border-stone-200/60 mb-4 shrink-0 space-y-3">
          <label className="block text-xs font-bold text-[#1E2024] uppercase tracking-wider">
            Sélectionner le Responsable CDZ / CDA à relancer :
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={selectedCdz}
              onChange={(e) => setSelectedCdz(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1E2024] outline-none cursor-pointer focus:border-[#EBC046]"
            >
              <option value="ALL">Tous les CDZ ({missingRows.length} retardataires)</option>
              <option value="NONE">-- Non assignés -- ({missingRows.filter(r => !r.collaborateur.Responsable).length})</option>
              {cdzCdaList.map(resp => {
                const count = missingRows.filter(r => r.collaborateur.Responsable === resp).length;
                return (
                  <option key={resp} value={resp}>
                    👤 {resp} ({count} retardataires)
                  </option>
                );
              })}
            </select>

            <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs">
              <span className="text-stone-500 font-medium">Email associé :</span>
              <span className="font-bold text-[#1E2024] truncate">
                {CDZ_EMAILS[selectedCdz] || 'Tous les emails'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Message Preview Box */}
        <div className="flex-1 min-h-[160px] overflow-y-auto mb-4 p-4 bg-[#1E2024] text-stone-100 rounded-2xl font-mono text-xs leading-relaxed shadow-inner border border-stone-800">
          <pre className="whitespace-pre-wrap font-sans">{generateMessageText(true)}</pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200/80 shrink-0">
          <button
            onClick={handleCopyMessage}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[#1E2024] bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full transition-all shadow-2xs flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
            <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le texte'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* WhatsApp Button */}
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer WhatsApp</span>
            </button>

            {/* Email Button */}
            <button
              onClick={handleSendEmail}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-[#1E2024] bg-[#F3CF55] hover:bg-[#EBC046] rounded-full shadow-md shadow-[#F3CF55]/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Mail className="w-4 h-4" />
              <span>Envoyer Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
