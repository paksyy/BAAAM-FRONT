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

interface SectionDemografiaProps {
  demografiaData: { estado: string; hombres: number; mujeres: number; total: number }[];
  poblacionPesqueraData: { entidad: string; pescadores: number }[];

  includePobCostera: boolean;
  includePescadores: boolean;
  includeGenero: boolean;

  setIncludePobCostera: (b: boolean) => void;
  setIncludePescadores: (b: boolean) => void;
  setIncludeGenero: (b: boolean) => void;
}

const PAGE_SIZE = 7;

export const SectionDemografia: React.FC<SectionDemografiaProps> = ({
  demografiaData,
  poblacionPesqueraData,

  includePobCostera,
  includePescadores,
  includeGenero,

  setIncludePobCostera,
  setIncludePescadores,
  setIncludeGenero,
}) => {
  // Paginación para población costera
  const [pagePobCostera, setPagePobCostera] = useState(0);
  const totalPagesPobCostera = Math.ceil(demografiaData.length / PAGE_SIZE);
  const slicePobCostera = demografiaData.slice(
    pagePobCostera * PAGE_SIZE,
    pagePobCostera * PAGE_SIZE + PAGE_SIZE
  );

  // Paginación para pescadores
  const [pagePescadores, setPagePescadores] = useState(0);
  const totalPagesPescadores = Math.ceil(poblacionPesqueraData.length / PAGE_SIZE);
  const slicePescadores = poblacionPesqueraData.slice(
    pagePescadores * PAGE_SIZE,
    pagePescadores * PAGE_SIZE + PAGE_SIZE
  );

  // Formatter de número con comas
  const yTickFormatter = (value: number) => value.toLocaleString();
  const tooltipFormatter = (value: number) => value.toLocaleString();

  return (
    <div className="space-y-8">
      {/* ─── Población costera – Top 10 estados ─── */}
      {includePobCostera && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Población costera – Top 10 estados
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includePobCostera}
                onChange={(e) => setIncludePobCostera(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slicePobCostera}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="estado"
                  stroke="#9CA3AF"
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Bar dataKey="hombres" stackId="a" fill="#3B82F6" name="Hombres" />
                <Bar dataKey="mujeres" stackId="a" fill="#EC4899" name="Mujeres" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesPobCostera > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pagePobCostera === 0}
                onClick={() => setPagePobCostera((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pagePobCostera === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pagePobCostera + 1} de {totalPagesPobCostera}
              </span>
              <button
                disabled={pagePobCostera >= totalPagesPobCostera - 1}
                onClick={() =>
                  setPagePobCostera((p) => Math.min(p + 1, totalPagesPobCostera - 1))
                }
                className={`px-3 py-1 rounded-lg ${
                  pagePobCostera >= totalPagesPobCostera - 1
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

      {/* ─── Pescadores registrados – Top 10 ─── */}
      {includePescadores && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Pescadores registrados – Top 10
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includePescadores}
                onChange={(e) => setIncludePescadores(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slicePescadores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="entidad"
                  stroke="#9CA3AF"
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Bar dataKey="pescadores" fill="#F59E0B" name="Pescadores" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {totalPagesPescadores > 1 && (
            <div className="flex justify-center space-x-4 mt-2">
              <button
                disabled={pagePescadores === 0}
                onClick={() => setPagePescadores((p) => Math.max(p - 1, 0))}
                className={`px-3 py-1 rounded-lg ${
                  pagePescadores === 0
                    ? 'bg-slate-700/30'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-cyan-200">
                Página {pagePescadores + 1} de {totalPagesPescadores}
              </span>
              <button
                disabled={pagePescadores >= totalPagesPescadores - 1}
                onClick={() =>
                  setPagePescadores((p) => Math.min(p + 1, totalPagesPescadores - 1))
                }
                className={`px-3 py-1 rounded-lg ${
                  pagePescadores >= totalPagesPescadores - 1
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

      {/* ─── Proporción total Hombres/Mujeres (Pie) ─── */}
      {includeGenero && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-cyan-200">
              Proporción total Hombres / Mujeres
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeGenero}
                onChange={(e) => setIncludeGenero(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Incluir en PDF</span>
            </label>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  data={[
                    {
                      name: 'Hombres',
                      value: demografiaData.reduce(
                        (acc, i) => acc + i.hombres,
                        0
                      ),
                    },
                    {
                      name: 'Mujeres',
                      value: demografiaData.reduce(
                        (acc, i) => acc + i.mujeres,
                        0
                      ),
                    },
                  ]}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#EC4899" />
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
    </div>
  );
};
