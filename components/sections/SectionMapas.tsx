import React from 'react';
import { FiMap } from 'react-icons/fi';
import { ChartContainer } from '../ui/ChartContainer';
import MapWrapper from '../../app/estadisticas/MapWrapper'; // Ajusta si MapWrapper vive en otra carpeta

interface SectionMapasProps {
  mapKeplerRef: React.RefObject<HTMLIFrameElement | null>;
  includeMapUnid: boolean;
  includeKepler: boolean;
  setIncludeMapUnid: (b: boolean) => void;
  setIncludeKepler: (b: boolean) => void;
}

const SectionMapas: React.FC<SectionMapasProps> = React.memo(({
  mapKeplerRef,
  includeMapUnid,
  includeKepler,
  setIncludeMapUnid,
  setIncludeKepler,
}) => {
  return (
    <section id="sec-mapas" className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <FiMap className="mr-2" /> Visualización de Mapas
      </h2>

      {/* Checkbox + Unidades de Producción */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={includeMapUnid}
          onChange={(e) => setIncludeMapUnid(e.target.checked)}
          className="accent-cyan-400"
        />
        <span>Mostrar mapa: Unidades de Producción (INEGI)</span>
      </div>
      {includeMapUnid && (
        <ChartContainer
          id="mapUnid"
          title="Unidades de Producción (INEGI)"
          description="Ubicaciones de unidades de producción pesquera en México."
          downloadable={false}
        >
          <MapWrapper />
        </ChartContainer>
      )}

      {/* Checkbox + Kepler */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={includeKepler}
          onChange={(e) => setIncludeKepler(e.target.checked)}
          className="accent-cyan-400"
        />
        <span>Mostrar mapa: Cobertura Geoespacial (Kepler.gl)</span>
      </div>
      {includeKepler && (
        <ChartContainer id="keplerMap" title="Cobertura Geoespacial (Kepler.gl)" downloadable={false}>
          <iframe
            ref={mapKeplerRef}
            src="/kepler.gl.html"
            className="w-full h-full rounded-lg"
            width="100%"
            height="100%"
          />
        </ChartContainer>
      )}
    </section>
  );
});

export default SectionMapas;
