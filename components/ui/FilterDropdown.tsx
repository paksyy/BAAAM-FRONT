import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FilterState } from '../../hooks/useEstadisticasData';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  filterKey: keyof FilterState;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (key: keyof FilterState, value: string, checked: boolean) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValues,
  filterKey,
  icon: Icon,
  isOpen,
  onToggle,
  onChange,
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 rounded-lg"
    >
      <span className="flex items-center">
        <Icon className="mr-2" size={18} />
        {label}
      </span>
      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute z-40 w-full mt-1 bg-slate-800 rounded-lg shadow-lg border border-slate-600 max-h-56 overflow-y-auto"
        >
          <div className="p-2">
            <label className="flex items-center p-2 hover:bg-slate-700/60 rounded">
              <input
                type="checkbox"
                className="mr-2 accent-cyan-400"
                checked={selectedValues.includes('todas')}
                onChange={(e) => onChange(filterKey, 'todas', e.target.checked)}
              />
              <span>Todas</span>
            </label>

            {options.map((opt) => (
              <label key={opt} className="flex items-center p-2 hover:bg-slate-700/60 rounded">
                <input
                  type="checkbox"
                  className="mr-2 accent-cyan-400"
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => onChange(filterKey, opt, e.target.checked)}
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);