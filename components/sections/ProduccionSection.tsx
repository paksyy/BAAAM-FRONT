import React, { useState } from 'react';
import { FiBarChart, FiMap, FiAnchor, FiTrendingUp } from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FilterDropdown } from '../ui/FilterDropdown';
import { ChartContainer } from '../ui/ChartContainer';
import { FilterState } from '../../hooks/useEstadisticasData';

interface ProduccionSectionProps {
  filters: FilterState;
  selectedFilters: FilterState;
  openDropdowns: Record<string, boolean>;
  onToggleDropdown: (key: string) => void;
  onFilterChange: (key: keyof FilterState, value: string, checked: boolean) => void;
  produccionData: { year: string; captura: number; acuacultura: number }[];
  entidadesData: { entidad: string; peso: number; valor: number }[];
}

const PAGE_SIZE = 5;

export const ProduccionSection: React.FC<ProduccionSectionProps> = ({
  filters,
  selectedFilters,
  openDropdowns,
  onToggleDropdown,
  onFilterChange,
  produccionData,
  entidadesData,
}) => {
  // --- Paginación para "Producción por Año" ---
  const [pageYear, setPageYear] = useState(0);
  const totalPagesYear = Math.ceil(produccionData.length / PAGE_SIZE);
  const sliceProduccion = produccionData.slice(
    pageYear * PAGE_SIZE,
    pageYear * PAGE_SIZE + PAGE_SIZE
  );

  // --- Paginación para "Producción por Entidad" ---
  const [pageEnt, setPageEnt] = useState(0);
  const totalPagesEnt = Math.ceil(entidadesData.length / PAGE_SIZE);
  const sliceEntidades = entidadesData.slice(
    pageEnt * PAGE_SIZE,
    pageEnt * PAGE_SIZE + PAGE_SIZE
  );

  // Formatter que convierte números grandes a "M" (millones) y agrega comas
  const yTickFormatter = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} M`;
    }
    return value.toLocaleString();
  };

  const tooltipFormatter = (value: number) => value.toLocaleString();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggleDropdown = (key: string) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  return (
    <>
      <section id="sec-produccion-ano" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FiBarChart className="mr-2" /> Producción por Año
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterDropdown
            label="Entidades"
            options={filters.entidades}
            selectedValues={selectedFilters.entidades}
            filterKey="entidades"
            icon={FiMap}
            isOpen={openDropdown === 'Entidades'}
            onToggle={() => handleToggleDropdown('Entidades')}
            onChange={onFilterChange}
          />
          <FilterDropdown
            label="Especies"
            options={filters.especies}
            selectedValues={selectedFilters.especies}
            filterKey="especies"
            icon={FiAnchor}
            isOpen={openDropdown === 'Especies'}
            onToggle={() => handleToggleDropdown('Especies')}
            onChange={onFilterChange}
          />
          <FilterDropdown
            label="Años"
            options={filters.anos}
            selectedValues={selectedFilters.anos}
            filterKey="anos"
            icon={FiBarChart}
            isOpen={openDropdown === 'Años'}
            onToggle={() => handleToggleDropdown('Años')}
            onChange={onFilterChange}
          />
          <FilterDropdown
            label="Origen"
            options={filters.origenes}
            selectedValues={selectedFilters.origenes}
            filterKey="origenes"
            icon={FiTrendingUp}
            isOpen={openDropdown === 'Origen'}
            onToggle={() => handleToggleDropdown('Origen')}
            onChange={onFilterChange}
          />
        </div>

        <ChartContainer
          id="chartProdAnual"
          title=""
          description="Captura vs Acuacultura"
        >
          {sliceProduccion.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceProduccion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={yTickFormatter}
                />
                <Tooltip
                  formatter={(value) => tooltipFormatter(value as number)}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="captura"
                  stackId="a"
                  fill="#3B82F6"
                  name="Captura"
                />
                <Bar
                  dataKey="acuacultura"
                  stackId="a"
                  fill="#10B981"
                  name="Acuacultura"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-cyan-200">
              Sin datos para los filtros seleccionados
            </div>
          )}
        </ChartContainer>

        {/* Botones de paginación para "Producción por Año" */}
        {totalPagesYear > 1 && (
          <div className="flex justify-center space-x-4 mt-2">
            <button
              disabled={pageYear === 0}
              onClick={() => setPageYear((p) => Math.max(p - 1, 0))}
              className={`px-3 py-1 rounded-lg ${
                pageYear === 0 ? 'bg-slate-700/30' : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-cyan-200">
              Página {pageYear + 1} de {totalPagesYear}
            </span>
            <button
              disabled={pageYear >= totalPagesYear - 1}
              onClick={() => setPageYear((p) => Math.min(p + 1, totalPagesYear - 1))}
              className={`px-3 py-1 rounded-lg ${
                pageYear >= totalPagesYear - 1
                  ? 'bg-slate-700/30'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      <section id="sec-prod-entidad" className="space-y-6 mt-8">
        <h2 className="text-2xl font-bold flex items-center">
          <FiBarChart className="mr-2" /> Producción por Entidad
        </h2>

        <ChartContainer
          id="chartProdEntidad"
          title=""
          description="10 entidades con mayor peso desembarcado"
        >
          {sliceEntidades.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceEntidades}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="entidad"
                  stroke="#9CA3AF"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={yTickFormatter}
                />
                <Tooltip
                  formatter={(value) => tooltipFormatter(value as number)}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                />
                <Bar dataKey="peso" fill="#06B6D4" name="Peso (kg)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-cyan-200">
              Sin datos para los filtros seleccionados
            </div>
          )}
        </ChartContainer>

        {/* Botones de paginación para "Producción por Entidad" */}
        {totalPagesEnt > 1 && (
          <div className="flex justify-center space-x-4 mt-2">
            <button
              disabled={pageEnt === 0}
              onClick={() => setPageEnt((p) => Math.max(p - 1, 0))}
              className={`px-3 py-1 rounded-lg ${
                pageEnt === 0 ? 'bg-slate-700/30' : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-cyan-200">
              Página {pageEnt + 1} de {totalPagesEnt}
            </span>
            <button
              disabled={pageEnt >= totalPagesEnt - 1}
              onClick={() => setPageEnt((p) => Math.min(p + 1, totalPagesEnt - 1))}
              className={`px-3 py-1 rounded-lg ${
                pageEnt >= totalPagesEnt - 1
                  ? 'bg-slate-700/30'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </>
  );
};
