'use client';
import { TAGS } from '@/constants/tags';
import { FiChevronDown } from 'react-icons/fi';

interface FilterBarProps {
  sort: 'newest' | 'likes' | undefined;
  ventanillaActive: boolean;
  selectedTag?: string;
  onSortChange: (sort: 'newest' | 'likes') => void;
  onVentanillaToggle: () => void;
  onTagChange: (tag?: string) => void;
}

export default function FilterBar({
  sort,
  ventanillaActive,
  selectedTag,
  onSortChange,
  onVentanillaToggle,
  onTagChange
}: FilterBarProps) {
  const filteredTags = TAGS.filter(t => t !== 'ventanilla para mujeres');

  return (
    <div className="space-y-2">  
      <div className="flex flex-wrap items-center gap-2">
        {/* Botón Más recientes */}
        <button
          onClick={() => onSortChange('newest')}
          className={`px-3 py-1.5 rounded-lg text-s ${
            sort === 'newest' || sort === undefined 
              ? 'bg-cyan-500 text-slate-900 font-medium'
              : 'bg-slate-800/50 hover:bg-slate-800/70 text-slate-300'
          } transition-colors`}
        >
          Recientes
        </button>
        
        {/* Botón Más relevantes */}
        <button
          onClick={() => onSortChange('likes')}
          className={`px-3 py-1.5 rounded-lg text-s ${
            sort === 'likes' 
              ? 'bg-cyan-500 text-slate-900 font-medium' 
              : 'bg-slate-800/50 hover:bg-slate-800/70 text-slate-300'
          } transition-colors`}
        >
          Relevantes
        </button>
        
        {/* Botón Ventanilla */}
        <button
          onClick={onVentanillaToggle}
          className={`px-3 py-1.5 rounded-lg text-s ${
            ventanillaActive 
              ? 'bg-purple-500 text-white font-medium' 
              : 'bg-slate-800/50 hover:bg-slate-800/70 text-purple-300'
          } transition-colors`}
        >
          Ventanilla para mujeres
        </button>

        {/* Selector de Tags con ícono */}
        <div className="relative shrink-0">
          <select
            value={selectedTag || ''}
            onChange={(e) => onTagChange(e.target.value || undefined)}
            /*  w-40 ≈ 10rem; cámbialo a gusto
                pr-7 deja hueco para el icono       */
            className="pl-3 pr-8 py-1.5 w-40 md:w-48 truncate
                      rounded-lg bg-slate-800/50 hover:bg-slate-800/70
                      text-slate-300 text-sm focus:outline-none appearance-none"
          >
            <option value="">Categorías</option>
            {filteredTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <FiChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={14}
          />
        </div>
      </div>
    </div>
  );
}