'use client';
import { useEffect, useState } from 'react';
import { TAGS } from '@/constants/tags';
import { FiChevronDown } from 'react-icons/fi';

export default function TagPicker({ selected, onChange }: {
  selected?: string; onChange: (t?: string) => void;
}) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  // Filtrar y ordenar tags
  useEffect(() => {
    const filtered = TAGS
      .filter(t => t !== 'ventanilla para mujeres')
      .sort((a, b) => a.localeCompare(b));
    setAllTags(filtered);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={selected || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-full bg-slate-700/70 p-2 rounded focus:outline-none text-sm text-white appearance-none"
        >
          <option value="">Todas las categorías</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <FiChevronDown className="text-slate-400 absolute right-2 pointer-events-none" />
      </div>
    </div>
  );
}