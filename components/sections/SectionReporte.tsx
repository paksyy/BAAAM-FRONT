import React, { useRef, useEffect } from 'react';

interface SectionReporteProps {
  includeProdYear: boolean;
  setIncludeProdYear: (v: boolean) => void;
  includeProdEntidad: boolean;
  setIncludeProdEntidad: (v: boolean) => void;
  includePrecioTipo: boolean;
  setIncludePrecioTipo: (v: boolean) => void;
  includeDistribEstab: boolean;
  setIncludeDistribEstab: (v: boolean) => void;
  includePrecioRest: boolean;
  setIncludePrecioRest: (v: boolean) => void;
  includePrecioPescad: boolean;
  setIncludePrecioPescad: (v: boolean) => void;
  includeTratamiento: boolean;
  setIncludeTratamiento: (v: boolean) => void;
  includeNumEspecies: boolean;
  setIncludeNumEspecies: (v: boolean) => void;
  includePobCostera: boolean;
  setIncludePobCostera: (v: boolean) => void;
  includePescadores: boolean;
  setIncludePescadores: (v: boolean) => void;
  includeGenero: boolean;
  setIncludeGenero: (v: boolean) => void;
  includeMapUnid: boolean;
  setIncludeMapUnid: (v: boolean) => void;
  includeKepler: boolean;
  setIncludeKepler: (v: boolean) => void;
  handleGeneratePDF: () => void;
}

export const SectionReporte: React.FC<SectionReporteProps> = ({
  includeProdYear,
  setIncludeProdYear,
  includeProdEntidad,
  setIncludeProdEntidad,
  includePrecioTipo,
  setIncludePrecioTipo,
  includeDistribEstab,
  setIncludeDistribEstab,
  includePrecioRest,
  setIncludePrecioRest,
  includePrecioPescad,
  setIncludePrecioPescad,
  includeTratamiento,
  setIncludeTratamiento,
  includeNumEspecies,
  setIncludeNumEspecies,
  includePobCostera,
  setIncludePobCostera,
  includePescadores,
  setIncludePescadores,
  includeGenero,
  setIncludeGenero,
  includeMapUnid,
  setIncludeMapUnid,
  includeKepler,
  setIncludeKepler,
  handleGeneratePDF,
}) => {
  const allChecks = [
    includeProdYear,
    includeProdEntidad,
    includePrecioTipo,
    includeDistribEstab,
    includePrecioRest,
    includePrecioPescad,
    includeTratamiento,
    includeNumEspecies,
    includePobCostera,
    includePescadores,
    includeGenero,
  ];

  const allSelected  = allChecks.every(Boolean);   // true  si TODOS marcados
  const someSelected = allChecks.some(Boolean);   // true  si AL MENOS uno

  const masterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.indeterminate = !allSelected && someSelected;
    }
  }, [allSelected, someSelected]);

  const toggleAll = (checked: boolean) => {
    setIncludeProdYear(checked);
    setIncludeProdEntidad(checked);
    setIncludePrecioTipo(checked);
    setIncludeDistribEstab(checked);
    setIncludePrecioRest(checked);
    setIncludePrecioPescad(checked);
    setIncludeTratamiento(checked);
    setIncludeNumEspecies(checked);
    setIncludePobCostera(checked);
    setIncludePescadores(checked);
    setIncludeGenero(checked);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Reporte de Gráficas</h2>
      <p className="text-cyan-100/80">
        Selecciona las gráficas que quieres incluir en el PDF final:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* ───── Checkbox maestro ───── */}
        <label className="flex items-center space-x-2 font-semibold">
          <input
            ref={masterRef}
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAll(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Seleccionar todo</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeProdYear}
            onChange={(e) => setIncludeProdYear(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Producción por Año</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeProdEntidad}
            onChange={(e) => setIncludeProdEntidad(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Producción por Entidad</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includePrecioTipo}
            onChange={(e) => setIncludePrecioTipo(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Precio promedio por tipo de establecimiento</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeDistribEstab}
            onChange={(e) => setIncludeDistribEstab(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Distribución de muestras</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includePrecioRest}
            onChange={(e) => setIncludePrecioRest(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Precio por especie – Restaurantes</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includePrecioPescad}
            onChange={(e) => setIncludePrecioPescad(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Precio por especie – Pescaderías</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeTratamiento}
            onChange={(e) => setIncludeTratamiento(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Precio por tratamiento y especie</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeNumEspecies}
            onChange={(e) => setIncludeNumEspecies(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Número de especies por estado</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includePobCostera}
            onChange={(e) => setIncludePobCostera(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Población costera – Top 10 estados</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includePescadores}
            onChange={(e) => setIncludePescadores(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Pescadores registrados – Top 10</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeGenero}
            onChange={(e) => setIncludeGenero(e.target.checked)}
            className="accent-cyan-400"
          />
          <span>Proporción total hombres/mujeres</span>
        </label>
      </div>

      <div className="text-center">
        <button
          onClick={handleGeneratePDF}
          className="mt-6 inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          Generar Reporte PDF
        </button>
      </div>
    </section>
  );
};

export default SectionReporte;
