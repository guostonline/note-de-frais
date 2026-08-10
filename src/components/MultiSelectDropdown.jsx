import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search, Filter } from 'lucide-react';

export default function MultiSelectDropdown({
  label,
  options = [],
  selectedValues = [],
  onChange,
  icon: Icon = Filter,
  placeholder = "Tous",
  colorClass = "text-sky-500"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    String(opt.label || opt).toLowerCase().includes(search.toLowerCase())
  );

  const isAllSelected = selectedValues.length === 0 || selectedValues.includes('ALL');

  const toggleOption = (val) => {
    if (val === 'ALL') {
      onChange([]);
      return;
    }

    let newSelected = [...selectedValues.filter(v => v !== 'ALL')];
    if (newSelected.includes(val)) {
      newSelected = newSelected.filter(v => v !== val);
    } else {
      newSelected.push(val);
    }
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange([]);
  };

  const renderTriggerText = () => {
    if (isAllSelected) return placeholder;
    if (selectedValues.length === 1) {
      const found = options.find(o => (o.value || o) === selectedValues[0]);
      return found ? (found.label || found) : selectedValues[0];
    }
    return `${selectedValues.length} sélectionnés`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-left shadow-sm transition-all outline-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={`w-4 h-4 shrink-0 ${colorClass}`} />}
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
              {label}
            </span>
            <span className="block text-xs font-semibold text-slate-800 truncate leading-tight mt-0.5">
              {renderTriggerText()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isAllSelected && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-700 rounded-full">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-2 animate-fade-in min-w-[220px]">
          {/* Internal Search */}
          {options.length > 5 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-[11px] px-1 py-0.5 text-slate-500 border-b border-slate-100 pb-1">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`hover:text-sky-600 font-medium ${isAllSelected ? 'text-sky-600 font-bold' : ''}`}
            >
              Tous sélectionner
            </button>
            {!isAllSelected && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-rose-500 hover:underline font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-400">Aucun résultat</div>
            ) : (
              filteredOptions.map((opt) => {
                const val = opt.value !== undefined ? opt.value : opt;
                const displayLabel = opt.label !== undefined ? opt.label : opt;
                const isSelected = selectedValues.includes(val);

                return (
                  <button
                    type="button"
                    key={val}
                    onClick={() => toggleOption(val)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      isSelected ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{displayLabel}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
