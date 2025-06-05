// components/sections/SectionPrecios.tsx
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SectionPreciosProps {
  preciosEstablecimientoData: {
    tipo: string;
    total: number;
    count: number;
    promedio: number;
  }[];
  precioEspecieRestData: { especie: string; promedio: number }[];
  precioEspeciePescadData: { especie: string; promedio: number }[];
  tratamientoEspecieData: {
    tratamiento: string;
    especie: string;
    promedio: number;
  }[];
  numEspeciesEstadoData: { estado: string; count: number }[];

  includePrecioTipo: boolean;
  includeDistribEstab: boolean;
  includePrecioRest: boolean;
  includePrecioPescad: boolean;
  includeTratamiento: boolean;
  includeNumEspecies: boolean;

  setIncludePrecioTipo: (b: boolean) => void;
  setIncludeDistribEstab: (b: boolean) => void;
  setIncludePrecioRest: (b: boolean) => void;
  setIncludePrecioPescad: (b: boolean) => void;
  setIncludeTratamiento: (b: boolean) => void;
  setIncludeNumEspecies: (b: boolean) => void;
}

const PAGE_SIZE = 7; // Cantidad de elementos por página

export const SectionPrecios: React.FC<SectionPreciosProps> = ({
  preciosEstablecimientoData,
  precioEspecieRestData,
  precioEspeciePescadData,
  tratamientoEspecieData,
  numEspeciesEstadoData,

  includePrecioTipo,
  includeDistribEstab,
  includePrecioRest,
  includePrecioPescad,
  includeTratamiento,
  includeNumEspecies,

  setIncludePrecioTipo,
  setIncludeDistribEstab,
  setIncludePrecioRest,
  setIncludePrecioPescad,
  setIncludeTratamiento,
  setIncludeNumEspecies,
}) => {
  // ─── PAGINACIÓN ───
  const [pageTipo, setPageTipo] = useState(0);
  const totalPagesTipo = Math.ceil(preciosEstablecimientoData.length / PAGE_SIZE);
  const sliceTipo = preciosEstablecimientoData.slice(
    pageTipo * PAGE_SIZE,
    pageTipo * PAGE_SIZE + PAGE_SIZE
  );

  const [pageEspecieRest, setPageEspecieRest] = useState(0);
  const totalPagesEspecieRest = Math.ceil(precioEspecieRestData.length / PAGE_SIZE);
  const sliceEspecieRest = precioEspecieRestData.slice(
    pageEspecieRest * PAGE_SIZE,
    pageEspecieRest * PAGE_SIZE + PAGE_SIZE
  );

  const [pageEspeciePesc, setPageEspeciePesc] = useState(0);
  const totalPagesEspeciePesc = Math.ceil(precioEspeciePescadData.length / PAGE_SIZE);
  const sliceEspeciePesc = precioEspeciePescadData.slice(
    pageEspeciePesc * PAGE_SIZE,
    pageEspeciePesc * PAGE_SIZE + PAGE_SIZE
  );

  const [pageTratam, setPageTratam] = useState(0);
  const totalPagesTratam = Math.ceil(tratamientoEspecieData.length / PAGE_SIZE);
  const sliceTratam = tratamientoEspecieData.slice(
    pageTratam * PAGE_SIZE,
    pageTratam * PAGE_SIZE + PAGE_SIZE
  );

  const [pageNumEsp, setPageNumEsp] = useState(0);
  const totalPagesNumEsp = Math.ceil(numEspeciesEstadoData.length / PAGE_SIZE);
  const sliceNumEsp = numEspeciesEstadoData.slice(
    pageNumEsp * PAGE_SIZE,
    pageNumEsp * PAGE_SIZE + PAGE_SIZE
  );

  // ─── FORMATTERS ───
  const yTickFormatter = (value: number) => value.toLocaleString();
  const tooltipFormatter = (value: number) => value.toLocaleString();
  const pieLabel = (props: any) =>
    `${(props.percent * 100).toFixed(1)}%`;

  return (
    <div className="space-y-8">
      {/* ─── Precio promedio por Tipo de establecimiento ─── */}
      {includePrecioTipo && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Precio promedio por tipo de establecimiento
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includePrecioTipo}
                onChange={(e) => setIncludePrecioTipo(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceTipo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="tipo" stroke="#9CA3AF" />
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
                <Bar dataKey="promedio" fill="#10B981" name="MXN/kg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesTipo > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pageTipo === 0}
                onClick={() => setPageTipo((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pageTipo === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pageTipo + 1} de {totalPagesTipo}
              </span>
              <button
                disabled={pageTipo >= totalPagesTipo - 1}
                onClick={() =>
                  setPageTipo((p) => Math.min(p + 1, totalPagesTipo - 1))
                }
                className={`px-3 py-1 rounded-lg ${
                  pageTipo >= totalPagesTipo - 1
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Distribución de muestras ─── */}
      {includeDistribEstab && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Distribución de muestras
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeDistribEstab}
                onChange={(e) => setIncludeDistribEstab(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={preciosEstablecimientoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  labelLine={false}
                  label={pieLabel}
                >
                  {preciosEstablecimientoData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        [
                          '#0088FE',
                          '#00C49F',
                          '#FFBB28',
                          '#FF8042',
                          '#EC4899',
                          '#3B82F6',
                        ][idx % 6]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => tooltipFormatter(value as number)}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Precio por especie – Restaurantes ─── */}
      {includePrecioRest && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Precio por especie – Restaurantes
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includePrecioRest}
                onChange={(e) => setIncludePrecioRest(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceEspecieRest}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="especie"
                  stroke="#9CA3AF"
                  angle={-40}
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
                <Bar dataKey="promedio" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesEspecieRest > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pageEspecieRest === 0}
                onClick={() => setPageEspecieRest((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pageEspecieRest === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pageEspecieRest + 1} de {totalPagesEspecieRest}
              </span>
              <button
                disabled={pageEspecieRest >= totalPagesEspecieRest - 1}
                onClick={() =>
                  setPageEspecieRest((p) =>
                    Math.min(p + 1, totalPagesEspecieRest - 1)
                  )
                }
                className={`px-3 py-1 rounded-lg ${
                  pageEspecieRest >= totalPagesEspecieRest - 1
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Precio por especie – Pescaderías ─── */}
      {includePrecioPescad && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Precio por especie – Pescaderías
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includePrecioPescad}
                onChange={(e) => setIncludePrecioPescad(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceEspeciePesc}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="especie"
                  stroke="#9CA3AF"
                  angle={-40}
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
                <Bar dataKey="promedio" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesEspeciePesc > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pageEspeciePesc === 0}
                onClick={() => setPageEspeciePesc((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pageEspeciePesc === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pageEspeciePesc + 1} de {totalPagesEspeciePesc}
              </span>
              <button
                disabled={pageEspeciePesc >= totalPagesEspeciePesc - 1}
                onClick={() =>
                  setPageEspeciePesc((p) =>
                    Math.min(p + 1, totalPagesEspeciePesc - 1)
                  )
                }
                className={`px-3 py-1 rounded-lg ${
                  pageEspeciePesc >= totalPagesEspeciePesc - 1
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Precio por tratamiento y especie ─── */}
      {includeTratamiento && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Precio por tratamiento y especie
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeTratamiento}
                onChange={(e) => setIncludeTratamiento(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceTratam}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="especie"
                  stroke="#9CA3AF"
                  angle={-40}
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
                <Legend />
                {Array.from(
                  new Set(tratamientoEspecieData.map((d) => d.tratamiento))
                ).map((trat, idx) => (
                  <Bar
                    key={trat}
                    dataKey={(row: any) =>
                      row.tratamiento === trat ? row.promedio : 0
                    }
                    stackId="a"
                    name={trat}
                    fill={
                      [
                        '#0088FE',
                        '#00C49F',
                        '#FFBB28',
                        '#FF8042',
                        '#EC4899',
                        '#3B82F6',
                      ][idx % 6]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesTratam > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pageTratam === 0}
                onClick={() => setPageTratam((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pageTratam === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pageTratam + 1} de {totalPagesTratam}
              </span>
              <button
                disabled={pageTratam >= totalPagesTratam - 1}
                onClick={() =>
                  setPageTratam((p) =>
                    Math.min(p + 1, totalPagesTratam - 1)
                  )
                }
                className={`px-3 py-1 rounded-lg ${
                  pageTratam >= totalPagesTratam - 1
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Número de especies por estado ─── */}
      {includeNumEspecies && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Número de especies por estado
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeNumEspecies}
                onChange={(e) => setIncludeNumEspecies(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceNumEsp}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="estado"
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
                <Bar dataKey="count" fill="#F59E0B" name="Número de especies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesNumEsp > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pageNumEsp === 0}
                onClick={() => setPageNumEsp((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pageNumEsp === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pageNumEsp + 1} de {totalPagesNumEsp}
              </span>
              <button
                disabled={pageNumEsp >= totalPagesNumEsp - 1}
                onClick={() =>
                  setPageNumEsp((p) =>
                    Math.min(p + 1, totalPagesNumEsp - 1)
                  )
                }
                className={`px-3 py-1 rounded-lg ${
                  pageNumEsp >= totalPagesNumEsp - 1
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
