'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';

interface FilterData {
  raz_sociales: Array<{ id: number; nombre: string }>;
  categorias: Array<{ id: number; nombre: string }>;
  estados: Array<{ id: number; nombre: string }>;
}

interface FilterModalProps {
  filters: FilterData;
  initialSelected: {
    raz_social?: number;
    categoria?: number;
    estado?: number;
    contacto: boolean;
  };
  onApply: (filters: {
    raz_social?: number;
    categoria?: number;
    estado?: number;
    contacto: boolean;
  }) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  filters,
  initialSelected,
  onApply,
  onClose
}) => {
  const [selected, setSelected] = useState({
    raz_social: initialSelected.raz_social?.toString() || '',
    categoria: initialSelected.categoria?.toString() || '',
    estado: initialSelected.estado?.toString() || '',
    contacto: initialSelected.contacto || false
  });

  const handleApply = () => {
    onApply({
      raz_social: Number(selected.raz_social) || undefined,
      categoria: Number(selected.categoria) || undefined,
      estado: Number(selected.estado) || undefined,
      contacto: selected.contacto
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Filtros Avanzados
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Razón Social */}
          <div>
            <label className="block text-sm mb-3 text-cyan-300">Razón Social</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 appearance-none outline-none transition-all"
                value={selected.raz_social}
                onChange={(e) => setSelected({ ...selected, raz_social: e.target.value })}
              >
                <option value="" className="bg-slate-800">Todas las Razones Sociales</option>
                {filters.raz_sociales.map(rs => (
                  <option 
                    key={rs.id} 
                    value={rs.id}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    {rs.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm mb-3 text-cyan-300">Categoría</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 appearance-none outline-none transition-all"
                value={selected.categoria}
                onChange={(e) => setSelected({ ...selected, categoria: e.target.value })}
              >
                <option value="" className="bg-slate-800">Todas las Categorías</option>
                {filters.categorias.map(cat => (
                  <option 
                    key={cat.id} 
                    value={cat.id}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm mb-3 text-cyan-300">Estado</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 appearance-none outline-none transition-all"
                value={selected.estado}
                onChange={(e) => setSelected({ ...selected, estado: e.target.value })}
              >
                <option value="" className="bg-slate-800">Todos los Estados</option>
                {filters.estados.map(est => (
                  <option 
                    key={est.id} 
                    value={est.id}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    {est.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div 
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors"
            onClick={() => setSelected({ ...selected, contacto: !selected.contacto })}
          >
            <div className={`w-6 h-6 flex items-center justify-center rounded-md border transition-colors
              ${selected.contacto 
                ? 'bg-cyan-400 border-cyan-400' 
                : 'bg-slate-800 border-slate-600'}`}
            >
              {selected.contacto && <FiCheck className="text-slate-900" size={16} />}
            </div>
            <span className="text-sm">Mostrar solo entidades con información de contacto</span>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Aplicar Filtros
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterModal;