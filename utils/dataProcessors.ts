import {
  PescaData,
  ComunidadCostera,
  GenBankData,
  PoblacionPesquera,
  FilterState,
} from '../hooks/useEstadisticasData';

type NormalizedGenBankRow = Omit<GenBankData, 'Tipo de establecimiento'> & {
  'Tipo de establecimiento': string;
};

/** ─────────────── NORMALIZACIONES ─────────────── **/

// Normaliza el texto (trim + lowercase)
const normalizeString = (str: string | undefined): string =>
  (str ?? '').trim().toLowerCase();

export const getProduccionData = (
  pescaData: PescaData[],
  selectedFilters: FilterState
) => {
  if (!pescaData.length) return [];

  let data = pescaData.map((d) => ({
    ...d,
    ORIGEN: normalizeString(d.ORIGEN) === 'captura' ? 'Captura' : 'Acuacultura',
  }));

  if (!selectedFilters.entidades.includes('todas'))
    data = data.filter((d) => selectedFilters.entidades.includes(d.ENTIDAD));

  if (!selectedFilters.especies.includes('todas'))
    data = data.filter((d) =>
      selectedFilters.especies.includes(d.NOMBRE_PRINCIPAL_ESPECIE)
    );

  if (!selectedFilters.anos.includes('todas'))
    data = data.filter((d) =>
      selectedFilters.anos.includes(d.ANO.toString())
    );

  if (!selectedFilters.origenes.includes('todas'))
    data = data.filter((d) => {
      // Comparamos sin importar mayúsculas/minúsculas
      const origenNorm = normalizeString(d.ORIGEN);
      return selectedFilters.origenes.some(
        (o) => normalizeString(o) === origenNorm
      );
    });

  const byYear: Record<
    string,
    { year: string; captura: number; acuacultura: number }
  > = {};
  data.forEach((d) => {
    const y = d.ANO.toString();
    if (!byYear[y]) byYear[y] = { year: y, captura: 0, acuacultura: 0 };
    if (d.ORIGEN === 'Captura') byYear[y].captura += d.PESO_DESEMBARCADO_KG;
    else byYear[y].acuacultura += d.PESO_DESEMBARCADO_KG;
  });

  return Object.values(byYear).sort((a, b) => +a.year - +b.year);
};

export const getEntidadesData = (
  pescaData: PescaData[],
  selectedFilters: FilterState
) => {
  if (!pescaData.length) return [];
  let data = pescaData.map((d) => ({
    ...d,
    ORIGEN: normalizeString(d.ORIGEN) === 'captura' ? 'Captura' : 'Acuacultura',
  }));

  if (!selectedFilters.especies.includes('todas'))
    data = data.filter((d) =>
      selectedFilters.especies.includes(d.NOMBRE_PRINCIPAL_ESPECIE)
    );
  if (!selectedFilters.anos.includes('todas'))
    data = data.filter((d) =>
      selectedFilters.anos.includes(d.ANO.toString())
    );
  if (!selectedFilters.origenes.includes('todas'))
    data = data.filter((d) => {
      const origenNorm = normalizeString(d.ORIGEN);
      return selectedFilters.origenes.some(
        (o) => normalizeString(o) === origenNorm
      );
    });

  const byEnt: Record<string, { entidad: string; peso: number; valor: number }> = {};
  data.forEach((d) => {
    if (!byEnt[d.ENTIDAD]) byEnt[d.ENTIDAD] = { entidad: d.ENTIDAD, peso: 0, valor: 0 };
    byEnt[d.ENTIDAD].peso += d.PESO_DESEMBARCADO_KG;
    byEnt[d.ENTIDAD].valor += d.VALOR_MEXICAN_PESOS;
  });

  return Object.values(byEnt)
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 10);
};

export const getDemografiaData = (comunidadesCosteras: ComunidadCostera[]) => {
  if (!comunidadesCosteras.length) return [];

  const groupedByState = comunidadesCosteras.reduce((acc, item) => {
    const estado = item.NOM_ENT;
    if (!acc[estado]) {
      acc[estado] = { estado, hombres: 0, mujeres: 0, total: 0 };
    }
    acc[estado].hombres += parseInt(item.POBMAS) || 0;
    acc[estado].mujeres += parseInt(item.POBFEM) || 0;
    acc[estado].total = acc[estado].hombres + acc[estado].mujeres;
    return acc;
  }, {} as any);

  return Object.values(groupedByState)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10);
};

export const getPoblacionPesqueraData = (
  poblacionPesquera: PoblacionPesquera[]
) => {
  if (!poblacionPesquera.length) return [];

  return poblacionPesquera
    .map((row) => ({
      entidad: row.ENTIDAD,
      pescadores:
        parseInt(row['TOTAL DE PESCADORES'].replace(/,/g, '')) || 0,
    }))
    .sort((a, b) => b.pescadores - a.pescadores)
    .slice(0, 10);
};

export const getPreciosEstablecimientoData = (
  genBankData: GenBankData[]
) => {
  if (!genBankData.length) return [];
  const acc: Record<
    string,
    { tipo: string; total: number; count: number; promedio: number }
  > = {};

  (genBankData as NormalizedGenBankRow[]).forEach((row) => {
    // Normalizamos y limpiamos espacios + lowercase
    const tipoNorm = normalizeString(row['Tipo de establecimiento']);
    if (!tipoNorm) return;

    // Reconstruimos “tipo” con capital inicial
    const tipoCapital = tipoNorm.charAt(0).toUpperCase() + tipoNorm.slice(1);
    const p = parseFloat(row['Precio por kg o porcion (MXN)']) || 0;
    if (!acc[tipoCapital])
      acc[tipoCapital] = { tipo: tipoCapital, total: 0, count: 0, promedio: 0 };
    acc[tipoCapital].total += p;
    acc[tipoCapital].count += 1;
    acc[tipoCapital].promedio = acc[tipoCapital].total / acc[tipoCapital].count;
  });

  return Object.values(acc);
};

/** ─────────────── EXPORTS PARA PRECIOS POR ESPECIE ─────────────── **/

// Agrupa “Precio por especie” según expresión regular (ej. /restaurante/i o /pescader/i)
const agruparPrecioPorEspecie = (
  genBankData: GenBankData[],
  filtro: RegExp
) => {
  const aux: Record<string, { especie: string; total: number; cnt: number }> =
    {};
  (genBankData as NormalizedGenBankRow[])
    .filter((row) => filtro.test(row['Tipo de establecimiento']))
    .forEach((row) => {
      const esp = row['Nombre común español'];
      const p = parseFloat(row['Precio por kg o porcion (MXN)']) || 0;
      if (!aux[esp]) aux[esp] = { especie: esp, total: 0, cnt: 0 };
      aux[esp].total += p;
      aux[esp].cnt += 1;
    });

  return Object.values(aux)
    .map((x) => ({ especie: x.especie, promedio: x.total / x.cnt }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 15);
};

export const getPrecioEspecieRestData = (genBankData: GenBankData[]) =>
  agruparPrecioPorEspecie(genBankData, /restaurante/i);

export const getPrecioEspeciePescadData = (genBankData: GenBankData[]) =>
  agruparPrecioPorEspecie(genBankData, /pescader/i);

export const getTratamientoEspecieData = (genBankData: GenBankData[]) => {
  if (!genBankData.length) return [];
  const aux: Record<
    string,
    { tratamiento: string; especie: string; total: number; cnt: number }
  > = {};

  (genBankData as NormalizedGenBankRow[]).forEach((row) => {
    const trat = row['Tratamiento que recibio la muestra']?.trim() ?? 'Sin Info';
    const esp = row['Nombre común español'];
    const key = `${trat}|${esp}`;
    const p = parseFloat(row['Precio por kg o porcion (MXN)']) || 0;
    if (!aux[key]) aux[key] = { tratamiento: trat, especie: esp, total: 0, cnt: 0 };
    aux[key].total += p;
    aux[key].cnt += 1;
  });

  return Object.values(aux).map((x) => ({
    tratamiento: x.tratamiento,
    especie: x.especie,
    promedio: x.total / x.cnt,
  }));
};

export const getNumEspeciesEstadoData = (genBankData: GenBankData[]) => {
  if (!genBankData.length) return [];
  const aux: Record<string, Set<string>> = {};
  (genBankData as NormalizedGenBankRow[]).forEach((row) => {
    const loc = row['Lugar de Colecta']?.trim() ?? 'Desconocido';
    const esp = row['Nombre común español'];
    if (!aux[loc]) aux[loc] = new Set();
    aux[loc].add(esp);
  });

  return Object.entries(aux)
    .map(([estado, s]) => ({ estado, count: s.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
};
