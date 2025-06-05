import { useState, useEffect } from 'react';

export interface PescaData {
  ENTIDAD: string;
  NOMBRE_PRINCIPAL_ESPECIE: string;
  ANO: number;
  ORIGEN: string;
  PESO_DESEMBARCADO_KG: number;
  VALOR_MEXICAN_PESOS: number;
}

export interface ComunidadCostera {
  NOM_LOC: string;
  NOM_ENT: string;
  POBMAS: string;
  POBFEM: string;
}

export interface GenBankData {
  'Lugar de Colecta': string;
  'Nombre común español': string;
  'Nombre científico - GENBANK': string;
  'Precio por kg o porcion (MXN)': string;
  'Tipo de establecimiento': string;
  'Tratamiento que recibio la muestra': string;
}

export interface PoblacionPesquera {
  ENTIDAD: string;
  'TOTAL DE PESCADORES': string;
}

export interface FilterState {
  entidades: string[];
  especies: string[];
  anos: string[];
  origenes: string[];
}

export const useEstadisticasData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pescaData, setPescaData] = useState<PescaData[]>([]);
  const [comunidadesCosteras, setComunidadesCosteras] = useState<ComunidadCostera[]>([]);
  const [genBankData, setGenBankData] = useState<GenBankData[]>([]);
  const [poblacionPesquera, setPoblacionPesquera] = useState<PoblacionPesquera[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    entidades: [],
    especies: [],
    anos: [],
    origenes: [],
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);

        const [pescaRaw, comRaw, gbRaw, popRaw] = await Promise.all([
          fetch('/data.json'),
          fetch('/Comunidades_Costeras_INEGI.json'),
          fetch('/GenBank_Restaurante_Pescaderia.json'),
          fetch('/Poblacion_pesquera_2023.json'),
        ]);

        const pescaJson = await pescaRaw.json() as PescaData[];
        const comJson = await comRaw.json() as ComunidadCostera[];
        const gbJson = await gbRaw.json() as GenBankData[];
        const popJson = await popRaw.json() as PoblacionPesquera[];

        setPescaData(pescaJson);
        setComunidadesCosteras(comJson);
        setGenBankData(gbJson);
        setPoblacionPesquera(popJson);

        setFilters({
          entidades: [...new Set(pescaJson.map((d) => d.ENTIDAD))].sort(),
          especies: [...new Set(pescaJson.map((d) => d.NOMBRE_PRINCIPAL_ESPECIE))].sort(),
          anos: [...new Set(pescaJson.map((d) => d.ANO.toString()))].sort(),
          origenes: [...new Set(pescaJson.map((d) => d.ORIGEN))].sort(),
        });
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return {
    isLoading,
    pescaData,
    comunidadesCosteras,
    genBankData,
    poblacionPesquera,
    filters,
  };
};