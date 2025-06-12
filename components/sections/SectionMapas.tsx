import React from 'react';
import { FiMap } from 'react-icons/fi';
import { ChartContainer } from '../ui/ChartContainer';
import MapWrapper from '../../app/estadisticas/MapWrapper';

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
        <ChartContainer
          id="keplerMap"
          title="Cobertura Geoespacial (Kepler.gl)"
          downloadable={false}
        >
          {/* 1 columna en móvil, 2 en pantallas ≥ md */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ——— Mapa izquierda: masculina ——— */}
            <div>
              <h3 className="text-center font-medium mb-2">
                Población masculina de comunidades pesqueras
              </h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  ref={mapKeplerRef}
                  src="/kepler.gl.html"
                  className="absolute inset-0 h-full w-[200%] translate-x-0"
                />
              </div>
            </div>

            {/* ——— Mapa derecha: femenina ——— */}
            <div>
              <h3 className="text-center font-medium mb-2">
                Población femenina de comunidades pesqueras
              </h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  src="/kepler.gl.html"
                  className="absolute inset-0 h-full w-[200%] -translate-x-1/2"
                />
              </div>
            </div>

          </div>
        </ChartContainer>
      )}
    </section>
  );
});

export default SectionMapas;
