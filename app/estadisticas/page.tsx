'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  Suspense,
  lazy,
} from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/NavBar/Navbar';
import DonationPopup from '../../components/DonationPopup';
import { useEstadisticasData } from '../../hooks/useEstadisticasData';
import { useFilters } from '../../hooks/useFilters';
import { StatsSection } from '../../components/sections/StatsSection';
import { ProduccionSection } from '../../components/sections/ProduccionSection';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ChartContainer y Recharts para los gráficos OFFSCREEN en el PDF
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
import { ChartContainer } from '../../components/ui/ChartContainer';

// Lazy-load de las secciones (exportan componentes nombrados)
const SectionPrecios = lazy(async () => {
  const mod = await import('../../components/sections/SectionPrecios');
  return { default: mod.SectionPrecios };
});
const SectionDemografia = lazy(async () => {
  const mod = await import('../../components/sections/SectionDemografia');
  return { default: mod.SectionDemografia };
});
const SectionMapas = lazy(() =>
  import('../../components/sections/SectionMapas')
);
const SectionReporte = lazy(async () => {
  const mod = await import('../../components/sections/SectionReporte');
  return { default: mod.SectionReporte };
});

import {
  getProduccionData,
  getEntidadesData,
  getPreciosEstablecimientoData,
  getPrecioEspecieRestData,
  getPrecioEspeciePescadData,
  getTratamientoEspecieData,
  getNumEspeciesEstadoData,
  getDemografiaData,
  getPoblacionPesqueraData,
} from '../../utils/dataProcessors';

const EstadisticasPage: React.FC = () => {
  // ───── Estados Globales ─────
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'produccion' | 'precios' | 'demografia' | 'mapas' | 'reporte'
  >('produccion');

  // ───── Datos y hooks personalizados ─────
  const { pescaData, comunidadesCosteras, genBankData, poblacionPesquera, filters } =
    useEstadisticasData();
  const { selectedFilters, openDropdowns, toggleDropdown, handleFilterChange } = useFilters();

  // ═════════ MEMO para datos procesados ═════════
  // 1) Producción
  const produccionData = useMemo(
    () => getProduccionData(pescaData, selectedFilters),
    [pescaData, selectedFilters]
  );
  const entidadesData = useMemo(
    () => getEntidadesData(pescaData, selectedFilters),
    [pescaData, selectedFilters]
  );

  // 2) Precios
  const preciosEstablecimientoData = useMemo(
    () => getPreciosEstablecimientoData(genBankData),
    [genBankData]
  );
  const precioEspecieRestData = useMemo(
    () => getPrecioEspecieRestData(genBankData),
    [genBankData]
  );
  const precioEspeciePescadData = useMemo(
    () => getPrecioEspeciePescadData(genBankData),
    [genBankData]
  );
  const tratamientoEspecieData = useMemo(
    () => getTratamientoEspecieData(genBankData),
    [genBankData]
  );
  const numEspeciesEstadoData = useMemo(
    () => getNumEspeciesEstadoData(genBankData),
    [genBankData]
  );

  // 3) Demografía
  const demografiaData = useMemo(
    () => getDemografiaData(comunidadesCosteras),
    [comunidadesCosteras]
  );
  const poblacionPesqueraData = useMemo(
    () => getPoblacionPesqueraData(poblacionPesquera),
    [poblacionPesquera]
  );

  // 4) Estadísticas rápidas
  const statsRapidas = useMemo(() => {
    if (!pescaData.length)
      return { produccion: '--', valor: '--', pescadores: '--', especies: '--' };

    const totalProd = pescaData.reduce((acc, i) => acc + i.PESO_DESEMBARCADO_KG, 0);
    const totalVal = pescaData.reduce((acc, i) => acc + i.VALOR_MEXICAN_PESOS, 0);
    const totalPesc = poblacionPesquera.reduce(
      (acc, i) => acc + (parseInt(i['TOTAL DE PESCADORES'].replace(/,/g, '')) || 0),
      0
    );
    const totalEsp = new Set(pescaData.map((d) => d.NOMBRE_PRINCIPAL_ESPECIE)).size;

    return {
      // Producción: “millones de kg”
      produccion: `${(totalProd / 1_000_000).toFixed(1)} M kg`,
      // Valor: “mil millones MXN”
      valor: `$${(totalVal / 1_000_000_000).toFixed(1)} mil millones MXN`,
      pescadores: totalPesc.toLocaleString(),
      especies: totalEsp.toString(),
    };
  }, [pescaData, poblacionPesquera]);

  // ═════════ Flags para incluir/excluir gráficas en el PDF ═════════
  const [includeProdYear, setIncludeProdYear] = useState(true);
  const [includeProdEntidad, setIncludeProdEntidad] = useState(true);
  const [includePrecioTipo, setIncludePrecioTipo] = useState(true);
  const [includeDistribEstab, setIncludeDistribEstab] = useState(true);
  const [includePrecioRest, setIncludePrecioRest] = useState(true);
  const [includePrecioPescad, setIncludePrecioPescad] = useState(true);
  const [includeTratamiento, setIncludeTratamiento] = useState(true);
  const [includeNumEspecies, setIncludeNumEspecies] = useState(true);
  const [includePobCostera, setIncludePobCostera] = useState(true);
  const [includePescadores, setIncludePescadores] = useState(true);
  const [includeGenero, setIncludeGenero] = useState(true);
  const [includeMapUnid, setIncludeMapUnid] = useState(true);
  const [includeKepler, setIncludeKepler] = useState(true);

  // ═════════ Ref para el <iframe> de Kepler ═════════
  const mapKeplerRef = useRef<HTMLIFrameElement>(null);

  // ═════════ Loader inicial ═════════
  useEffect(() => {
    const simulateLoad = async () => {
      setIsLoading(true);
      await new Promise((res) => setTimeout(res, 300));
      setIsLoading(false);
    };
    simulateLoad();
  }, []);

  // ═════════ Generar PDF con las gráficas seleccionadas ═════════
  const handleGeneratePDF = async () => {
    const doc = new jsPDF({ unit: 'px', format: 'a4' });
    doc.setFontSize(24);
    doc.text("Reporte de gráficas por plataforma BAA'AM", 24, 40);

    let yOffset = 80;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Excluimos mapas del PDF
    const charts = [
      { flag: includeProdYear, selector: '#offscreen_chartProdAnual', title: 'Producción por Año' },
      { flag: includeProdEntidad, selector: '#offscreen_chartProdEntidad', title: 'Producción por Entidad' },
      { flag: includePrecioTipo, selector: '#offscreen_chartPreciosTipo', title: 'Precio promedio por Tipo de establecimiento' },
      { flag: includeDistribEstab, selector: '#offscreen_chartDistribEstab', title: 'Distribución de muestras' },
      { flag: includePrecioRest, selector: '#offscreen_chartPrecioRest', title: 'Precio por especie – Restaurantes' },
      { flag: includePrecioPescad, selector: '#offscreen_chartPrecioPescad', title: 'Precio por especie – Pescaderías' },
      { flag: includeTratamiento, selector: '#offscreen_chartTratamiento', title: 'Precio por tratamiento y especie' },
      { flag: includeNumEspecies, selector: '#offscreen_chartNumEspecies', title: 'Número de especies por estado' },
      { flag: includePobCostera, selector: '#offscreen_chartPobCostera', title: 'Población costera – Top 10 estados' },
      { flag: includePescadores, selector: '#offscreen_chartPescadores', title: 'Pescadores registrados – Top 10' },
      { flag: includeGenero, selector: '#offscreen_chartGenero', title: 'Proporción total Hombres/Mujeres' },
      // No incluimos #offscreen_mapUnid ni #offscreen_keplerMap
    ];

    // Helper para convertir un SVG a PNG base64
    const svgToPngBase64 = (svgNode: SVGSVGElement): Promise<string> => {
      return new Promise((res, rej) => {
        try {
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svgNode);

          // Forzamos namespace si no existe
          if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          if (!svgString.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            svgString = svgString.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
          }

          const svgBase64 = window.btoa(unescape(encodeURIComponent(svgString)));
          const imgSrc = 'data:image/svg+xml;base64,' + svgBase64;

          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const bbox = svgNode.getBoundingClientRect();
            canvas.width = bbox.width;
            canvas.height = bbox.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              rej(new Error('No se pudo obtener contexto 2D'));
              return;
            }
            ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
            const pngBase64 = canvas.toDataURL('image/png');
            res(pngBase64);
          };
          img.onerror = (err) => {
            rej(err);
          };
          img.src = imgSrc;
        } catch (e) {
          rej(e);
        }
      });
    };

    for (const item of charts) {
      if (!item.flag) continue;

      // 1) Escribimos el título de la gráfica
      doc.setFontSize(18);
      doc.text(item.title, 24, yOffset);
      yOffset += 24;

      // 2) Buscamos el contenedor "offscreen"
      const container = document.querySelector(item.selector) as HTMLElement | null;
      if (!container) {
        continue;
      }

      // 3) Intentamos extraer primero el <svg class="recharts-surface">
      const rechartsSvg = container.querySelector('svg.recharts-surface') as SVGSVGElement | null;
      if (rechartsSvg) {
        try {
          const pngBase64 = await svgToPngBase64(rechartsSvg);
          const imgProps = doc.getImageProperties(pngBase64);
          const pdfWidth = pageWidth - 48; // margen 24px a cada lado
          const aspect = imgProps.height / imgProps.width;
          const pdfHeight = pdfWidth * aspect;

          if (yOffset + pdfHeight > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yOffset = 40;
          }
          doc.addImage(pngBase64, 'PNG', 24, yOffset, pdfWidth, pdfHeight);
          yOffset += pdfHeight + 24;
        } catch (err) {
          console.error(`Error convirtiendo SVG Recharts de ${item.selector}:`, err);
        }
        continue;
      }

      // 4) Si no hay <svg.recharts-surface>, rasterizamos todo el "container" con html2canvas
      try {
        const canvas = await html2canvas(container, {
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false,
          scrollX: 0,
          scrollY: -window.scrollY,
        });
        const pngData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(pngData);
        const pdfWidth = pageWidth - 48;
        const aspect = imgProps.height / imgProps.width;
        const pdfHeight = pdfWidth * aspect;

        if (yOffset + pdfHeight > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yOffset = 40;
        }
        doc.addImage(pngData, 'PNG', 24, yOffset, pdfWidth, pdfHeight);
        yOffset += pdfHeight + 24;
      } catch (e) {
        console.error(`Error rasterizando con html2canvas en ${item.selector}:`, e);
      }
    }

    doc.save('Reporte_BAAM.pdf');
  };

  // ═════════ RENDER principal ═════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />
      <DonationPopup />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-16">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Estadísticas Pesqueras
          </h1>
          <p className="text-cyan-100/90">
            Análisis interactivo de producción, precios, demografía y generación de reportes
          </p>
          {/* –– Sin buscador –– */}
        </motion.header>

        {/* STATS RÁPIDAS */}
        <StatsSection statsRapidas={statsRapidas} />

        {/* MENÚ SECCIONES */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setActiveSection('produccion')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'produccion'
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-slate-800/50 hover:bg-slate-800/70'
            }`}
          >
            Producción
          </button>
          <button
            onClick={() => setActiveSection('precios')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'precios'
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-slate-800/50 hover:bg-slate-800/70'
            }`}
          >
            Precios
          </button>
          <button
            onClick={() => setActiveSection('demografia')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'demografia'
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-slate-800/50 hover:bg-slate-800/70'
            }`}
          >
            Demografía
          </button>
          <button
            onClick={() => setActiveSection('mapas')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'mapas'
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-slate-800/50 hover:bg-slate-800/70'
            }`}
          >
            Mapas
          </button>
          <button
            onClick={() => setActiveSection('reporte')}
            className={`px-4 py-2 rounded-lg ${
              activeSection === 'reporte'
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-slate-800/50 hover:bg-slate-800/70'
            }`}
          >
            Reporte
          </button>
        </div>

        {/* SECCIÓN ACTUAL */}
        <Suspense fallback={<div className="text-center py-16">Cargando sección…</div>}>
          {activeSection === 'produccion' && (
            <ProduccionSection
              filters={filters}
              selectedFilters={selectedFilters}
              openDropdowns={openDropdowns}
              onToggleDropdown={toggleDropdown}
              onFilterChange={handleFilterChange}
              produccionData={produccionData}
              entidadesData={entidadesData}
            />
          )}

          {activeSection === 'precios' && (
            <SectionPrecios
              preciosEstablecimientoData={preciosEstablecimientoData}
              precioEspecieRestData={precioEspecieRestData}
              precioEspeciePescadData={precioEspeciePescadData}
              tratamientoEspecieData={tratamientoEspecieData}
              numEspeciesEstadoData={numEspeciesEstadoData}
              includePrecioTipo={includePrecioTipo}
              includeDistribEstab={includeDistribEstab}
              includePrecioRest={includePrecioRest}
              includePrecioPescad={includePrecioPescad}
              includeTratamiento={includeTratamiento}
              includeNumEspecies={includeNumEspecies}
              setIncludePrecioTipo={setIncludePrecioTipo}
              setIncludeDistribEstab={setIncludeDistribEstab}
              setIncludePrecioRest={setIncludePrecioRest}
              setIncludePrecioPescad={setIncludePrecioPescad}
              setIncludeTratamiento={setIncludeTratamiento}
              setIncludeNumEspecies={setIncludeNumEspecies}
            />
          )}

          {activeSection === 'demografia' && (
            <SectionDemografia
              demografiaData={demografiaData as {
                estado: string;
                hombres: number;
                mujeres: number;
                total: number;
              }[]}
              poblacionPesqueraData={poblacionPesqueraData}
              includePobCostera={includePobCostera}
              includePescadores={includePescadores}
              includeGenero={includeGenero}
              setIncludePobCostera={setIncludePobCostera}
              setIncludePescadores={setIncludePescadores}
              setIncludeGenero={setIncludeGenero}
            />
          )}

          {activeSection === 'mapas' && (
            <SectionMapas
              mapKeplerRef={mapKeplerRef}
              includeMapUnid={includeMapUnid}
              includeKepler={includeKepler}
              setIncludeMapUnid={setIncludeMapUnid}
              setIncludeKepler={setIncludeKepler}
            />
          )}

          {activeSection === 'reporte' && (
            <SectionReporte
              includeProdYear={includeProdYear}
              setIncludeProdYear={setIncludeProdYear}
              includeProdEntidad={includeProdEntidad}
              setIncludeProdEntidad={setIncludeProdEntidad}
              includePrecioTipo={includePrecioTipo}
              setIncludePrecioTipo={setIncludePrecioTipo}
              includeDistribEstab={includeDistribEstab}
              setIncludeDistribEstab={setIncludeDistribEstab}
              includePrecioRest={includePrecioRest}
              setIncludePrecioRest={setIncludePrecioRest}
              includePrecioPescad={includePrecioPescad}
              setIncludePrecioPescad={setIncludePrecioPescad}
              includeTratamiento={includeTratamiento}
              setIncludeTratamiento={setIncludeTratamiento}
              includeNumEspecies={includeNumEspecies}
              setIncludeNumEspecies={setIncludeNumEspecies}
              includePobCostera={includePobCostera}
              setIncludePobCostera={setIncludePobCostera}
              includePescadores={includePescadores}
              setIncludePescadores={setIncludePescadores}
              includeGenero={includeGenero}
              setIncludeGenero={setIncludeGenero}
              includeMapUnid={includeMapUnid}
              setIncludeMapUnid={setIncludeMapUnid}
              includeKepler={includeKepler}
              setIncludeKepler={setIncludeKepler}
              handleGeneratePDF={handleGeneratePDF}
            />
          )}
        </Suspense>
      </main>

      {/* Bloque OFFSCREEN con todas las gráficas para PDF */}
      <div
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '800px',
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '16px',
        }}
      >
        {/* 1) Producción por Año */}
        {includeProdYear && (
          <div
            id="offscreen_chartProdAnual"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ProduccionSection
              filters={filters}
              selectedFilters={selectedFilters}
              openDropdowns={{}}
              onToggleDropdown={() => {}}
              onFilterChange={() => {}}
              produccionData={produccionData}
              entidadesData={[]}
            />
          </div>
        )}

        {/* 2) Producción por Entidad */}
        {includeProdEntidad && (
          <div
            id="offscreen_chartProdEntidad"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ProduccionSection
              filters={filters}
              selectedFilters={selectedFilters}
              openDropdowns={{}}
              onToggleDropdown={() => {}}
              onFilterChange={() => {}}
              produccionData={[]}
              entidadesData={entidadesData}
            />
          </div>
        )}

        {/* 3) Precio promedio por Tipo de Establecimiento */}
        {includePrecioTipo && (
          <div
            id="offscreen_chartPreciosTipo"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartPreciosTipo" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={preciosEstablecimientoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="tipo" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
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
            </ChartContainer>
          </div>
        )}

        {/* 4) Distribución de Muestras */}
        {includeDistribEstab && (
          <div
            id="offscreen_chartDistribEstab"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartDistribEstab" title="">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preciosEstablecimientoData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  >
                    {preciosEstablecimientoData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EC4899', '#3B82F6'][idx % 6]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {/* 5) Precio por Especie – Restaurantes */}
        {includePrecioRest && (
          <div
            id="offscreen_chartPrecioRest"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartPrecioRest" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={precioEspecieRestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="especie"
                    stroke="#9CA3AF"
                    angle={-40}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
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
            </ChartContainer>
          </div>
        )}

        {/* 6) Precio por Especie – Pescaderías */}
        {includePrecioPescad && (
          <div
            id="offscreen_chartPrecioPescad"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartPrecioPescad" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={precioEspeciePescadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="especie"
                    stroke="#9CA3AF"
                    angle={-40}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
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
            </ChartContainer>
          </div>
        )}

        {/* 7) Precio por Tratamiento y Especie */}
        {includeTratamiento && (
          <div
            id="offscreen_chartTratamiento"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartTratamiento" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tratamientoEspecieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="especie"
                    stroke="#9CA3AF"
                    angle={-40}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                  />
                  <Legend />
                  {Array.from(
                    new Set((tratamientoEspecieData as any[]).map((d) => d.tratamiento))
                  ).map((trat, idx) => (
                    <Bar
                      key={trat}
                      dataKey={(row: any) => (row.tratamiento === trat ? row.promedio : 0)}
                      stackId="a"
                      name={trat}
                      fill={
                        ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EC4899', '#3B82F6'][idx % 6]
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {/* 8) Número de Especies por Estado */}
        {includeNumEspecies && (
          <div
            id="offscreen_chartNumEspecies"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartNumEspecies" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={numEspeciesEstadoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="estado"
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
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
            </ChartContainer>
          </div>
        )}

        {/* 9) Población costera por estado */}
        {includePobCostera && (
          <div
            id="offscreen_chartPobCostera"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartPobCostera" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demografiaData as { estado: string; hombres: number; mujeres: number; total: number }[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="estado"
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
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
            </ChartContainer>
          </div>
        )}

        {/* 10) Pescadores por estado */}
        {includePescadores && (
          <div
            id="offscreen_chartPescadores"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartPescadores" title="">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poblacionPesqueraData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="entidad"
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
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
            </ChartContainer>
          </div>
        )}

        {/* 11) Proporción total Hombres / Mujeres */}
        {includeGenero && (
          <div
            id="offscreen_chartGenero"
            style={{ width: 700, height: 300, marginBottom: 24 }}
          >
            <ChartContainer id="chartGenero" title="">
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
                        value: (demografiaData as { hombres: number; mujeres: number }[])
                          .reduce((acc, i) => acc + i.hombres, 0),
                      },
                      {
                        name: 'Mujeres',
                        value: (demografiaData as { hombres: number; mujeres: number }[])
                          .reduce((acc, i) => acc + i.mujeres, 0),
                      },
                    ]}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#EC4899" />
                  </Pie>
                  <Tooltip
                    formatter={(value) => (value as number).toLocaleString()}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {/* 12) Unidades de Producción (INEGI) */}
        {includeMapUnid && (
          <div
            id="offscreen_mapUnid"
            style={{ width: 700, height: 500, marginBottom: 24 }}
          >
            <ChartContainer id="mapUnid" title="">
              {/* Placeholder si no monta MapWrapper offscreen */}
              <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}>
                Mapa de Unidades de Producción
              </div>
            </ChartContainer>
          </div>
        )}

        {/* 13) Cobertura geoespacial (Kepler.gl) */}
        {includeKepler && (
          <div
            id="offscreen_keplerMap"
            style={{ width: 700, height: 500, marginBottom: 24 }}
          >
            <ChartContainer id="keplerMap" title="">
              <iframe
                ref={mapKeplerRef}
                src="/kepler.gl.html"
                className="w-full h-full rounded-lg"
                width="100%"
                height="100%"
              />
            </ChartContainer>
          </div>
        )}
      </div>

      {/* LOADER GLOBAL */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4">Cargando datos…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadisticasPage;
