import { useState } from 'react';
import { FilterState } from './useEstadisticasData';

export const useFilters = () => {
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    entidades: ['todas'],
    especies: ['todas'],
    anos: ['todas'],
    origenes: ['todas'],
  });

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (key: string) =>
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleFilterChange = (
    key: keyof FilterState,
    value: string,
    checked: boolean,
  ) => {
    setSelectedFilters((prev) => {
      const nuevo: FilterState = { ...prev };

      if (value === 'todas') {
        nuevo[key] = checked ? ['todas'] : [];
      } else {
        nuevo[key] = checked
          ? [...prev[key].filter((v) => v !== 'todas'), value]
          : prev[key].filter((v) => v !== value);

        if (nuevo[key].length === 0) nuevo[key] = ['todas'];
      }
      return nuevo;
    });
  };

  return {
    selectedFilters,
    openDropdowns,
    toggleDropdown,
    handleFilterChange,
  };
};