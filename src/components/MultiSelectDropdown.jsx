import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search, Filter } from 'lucide-react';
import { CdzAvatarBadge, getCdzAvatar } from '../utils/cdzAvatars';

export default function MultiSelectDropdown({
  label,
  options = [],
  selectedValues = [],
  onChange,
  icon: Icon = Filter,
  placeholder = "Tous",
  colorClass = "text-[#22252A]"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') { setIsOpen(false); setSearch(''); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const filteredOptions = options.filter(opt =>
    String(opt.label || opt).toLowerCase().includes(search.toLowerCase())
  );

  const isAllSelected = selectedValues.length === 0 || selectedValues.includes('ALL');

  const toggleOption = (val) => {
    if (val === 'ALL') { onChange([]); return; }
    let newSelected = [...selectedValues.filter(v => v !== 'ALL')];
    if (newSelected.includes(val)) {
      newSelected = newSelected.filter(v => v !== val);
    } else {
      newSelected.push(val);
    }
    onChange(newSelected);
  };

  const handleSelectAll = () => onChange([]);

  const renderTriggerText = () => {
    if (isAllSelected) return placeholder;
    if (selectedValues.length === 1) {
      const found = options.find(o => (o.value || o) === selectedValues[0]);
      return found ? (found.label || found) : selectedValues[0];
    }
    return `${selectedValues.length} sélectionnés`;
  };

  const singleSelectedAvatar = selectedValues.length === 1 ? getCdzAvatar(selectedValues[0]) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setIsOpen(prev => !prev); setSearch(''); }}
        className="w-full flex items-center justify-between gap-2 bg-white border border-stone-200/80 hover:border-stone-300 rounded-2xl px-3.5 py-2.5 text-left shadow-2xs transition-all outline-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {singleSelectedAvatar ? (
            <CdzAvatarBadge name={selectedValues[0]} size="sm" />
          ) : (
            Icon && <Icon className={`w-4 h-4 shrink-0 ${colorClass}`} />
          )}
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-tight">
              {label}
            </span>
            <span className="block text-xs font-bold text-[#1E2024] truncate leading-tight mt-0.5">
              {renderTriggerText()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isAllSelected && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F3CF55] text-[#1E2024] rounded-full shadow-2xs">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* ── Dropdown panel ──
          Desktop  → absolute, opens below
          Mobile   → fixed bottom sheet with backdrop                     */}
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-slate-900/30 backdrop-blur-sm animate-fade-in"
            onClick={() => { setIsOpen(false); setSearch(''); }}
          />

          {/* Panel */}
          <div className={`
            z-50 bg-white border border-stone-200/80 shadow-xl animate-fade-in
            /* Mobile: fixed bottom sheet */
            fixed sm:absolute
            bottom-0 sm:bottom-auto
            left-0 sm:left-0
            right-0 sm:right-auto
            top-auto sm:top-full
            w-full sm:w-auto sm:min-w-[240px]
            rounded-t-3xl sm:rounded-2xl
            p-4 sm:p-2.5
            mt-0 sm:mt-1.5
            space-y-2
          `}>
            {/* Mobile drag handle */}
            <div className="flex justify-center mb-2 sm:hidden">
              <div className="w-10 h-1 bg-stone-300 rounded-full" />
            </div>

            {/* Internal search */}
            {options.length > 5 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-xs bg-[#F6F4EB] border border-stone-200 rounded-xl outline-none focus:border-[#EBC046]"
                  autoFocus
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between text-[11px] px-1 py-0.5 text-stone-500 border-b border-stone-100 pb-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`hover:text-[#1E2024] font-semibold ${isAllSelected ? 'text-[#1E2024] font-extrabold underline' : ''}`}
              >
                Tous sélectionner
              </button>
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-rose-500 hover:underline font-semibold"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Options */}
            <div className="max-h-52 sm:max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-3 text-xs text-stone-400">Aucun résultat</div>
              ) : (
                filteredOptions.map((opt) => {
                  const val = opt.value !== undefined ? opt.value : opt;
                  const displayLabel = opt.label !== undefined ? opt.label : opt;
                  const isSelected = selectedValues.includes(val);
                  const hasCdzImg = getCdzAvatar(displayLabel);

                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => toggleOption(val)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-[#22252A] text-white font-semibold shadow-2xs'
                          : 'hover:bg-[#F6F4EB] text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {hasCdzImg && <CdzAvatarBadge name={displayLabel} size="xs" />}
                        <span className="truncate">{displayLabel}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F3CF55] shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Mobile close button */}
            <div className="sm:hidden pt-2 border-t border-stone-100">
              <button
                onClick={() => { setIsOpen(false); setSearch(''); }}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#22252A] hover:bg-stone-700 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
