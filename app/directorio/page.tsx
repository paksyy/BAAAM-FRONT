'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiMapPin, FiUser, FiAnchor } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import FilterModal from '../../components/FilterModal';
import Navbar from '../../components/NavBar/Navbar'

interface Empresa {
  id: string;
  nom_estab: string;
  raz_social?: string;
  categoria?: string;
  nom_representante?: string;
  grupo_funcional?: string;
  subgrupo_funcional?: string;
  nombre_cientifico?: string;
  nombre_comun?: string;
  acronimo?: string;
  telefono?: string;
  correoelec?: string;
  pais?: string;
  nom_vial?: string;
  numero_ext?: string;
  colonia?: string;
  cod_postal?: string;
  municipio?: string;
  estado?: string;
  localidad?: string;
  manzana?: string;
  latitud?: string;
  longitud?: string;
  www?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  telegram?: string;
  youtube?: string;
  especies_cientificas?: string[];
  especies_comunes?: string[];
}

interface FilterData {
  raz_sociales: Array<{ id: number; nombre: string }>;
  categorias: Array<{ id: number; nombre: string }>;
  estados: Array<{ id: number; nombre: string }>;
}

const Directorio = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [results, setResults] = useState<Empresa[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [gridKey, setGridKey] = useState<number>(0);
  const [filters, setFilters] = useState<FilterData>({
    raz_sociales: [],
    categorias: [],
    estados: []
  });
  const [activeFilters, setActiveFilters] = useState<{
    raz_social?: number;
    categoria?: number;
    estado?: number;
    contacto: boolean;
  }>({
    raz_social: undefined,
    categoria: undefined,
    estado: undefined,
    contacto: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 21,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empresas/filters`);
        const data: FilterData = await response.json();
        setFilters(data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (results && hasSearched) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [results, hasSearched]);

  // This effect will run when any search-related state changes
  useEffect(() => {
    if (hasSearched) {
      fetchResults();
    }
  }, [pagination.page, pagination.limit, activeFilters, hasSearched, searchText]);

  const fetchResults = async () => {
    setResults(null);
    setIsLoading(true);

    try {
      const response = await axios.get<{
        data: Empresa[],
        pagination: {
          page: number,
          limit: number,
          total: number,
          totalPages: number
        }
      }>(`${process.env.NEXT_PUBLIC_API_URL}/empresas`, {
        params: {
          search: searchText,
          raz_social: activeFilters.raz_social,
          categoria: activeFilters.categoria,
          estado: activeFilters.estado,
          contacto: activeFilters.contacto,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setResults(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setHasSearched(false);
    setResults(null);
    setActiveFilters({
      raz_social: undefined,
      categoria: undefined,
      estado: undefined,
      contacto: false
    });
  };

  const handleApplyFilters = (newFilters: {
    raz_social?: number;
    categoria?: number;
    estado?: number;
    contacto: boolean;
  }) => {
    setActiveFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Resetear a página 1
    setHasSearched(true);
    setShowFilterModal(false);
  };

  const handleCardClick = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
  };

  const handleCloseEmpresaModal = () => {
    setSelectedEmpresa(null);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />
      
      {/* Main content with proper padding to accommodate fixed navbar */}
      <div className="pt-16 px-4 lg:px-8 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-4xl mx-auto pt-8"
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Directorio Pesquero
          </h1>
          <p className="text-lg lg:text-xl text-cyan-100 font-light">
            Plataforma integral de empresas y organizaciones del sector pesquero y acuícola nacional
          </p>
        </motion.header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center items-center mb-16 max-w-3xl mx-auto"
        >
          <div className="relative w-full flex items-center bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl transition-all duration-300 focus-within:ring-2 ring-cyan-400">
            {searchText && (
              <button
                onClick={handleClearSearch}
                className="absolute left-4 text-cyan-300 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            )}
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar empresa, organización, especie o entidad..."
              className="w-full px-12 py-4 bg-transparent text-lg placeholder:text-cyan-100/50 text-white focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-4 p-2 text-cyan-300 hover:text-white transition-colors"
            >
              <FiSearch size={24} />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilterModal(true)}
            className="ml-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-lg"
          >
            <FiFilter size={24} className="text-cyan-300" />
          </motion.button>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-48 bg-slate-800/50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}

          <AnimatePresence mode='wait'>
            {results && results.length > 0 && (
              <motion.div
                key={gridKey}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeIn}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      onClick={() => handleCardClick(result)}
                      className="group bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/70 rounded-xl p-6 shadow-xl cursor-pointer transition-all duration-300 border border-slate-700/50 hover:border-cyan-400/30"
                    >
                      <div className="flex items-start mb-4">
                        <div className="p-3 bg-cyan-400/10 rounded-lg mr-4">
                          <FiAnchor className="text-cyan-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">
                            {result.nom_estab}
                          </h3>
                          <p className="text-sm text-cyan-100/70">
                            {result.municipio}, {result.estado}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-cyan-100/80">
                          <FiUser className="mr-2 text-cyan-400" />
                          <span>{result.nom_representante || 'Representante no disponible'}</span>
                        </div>
                        <div className="flex items-center text-sm text-cyan-100/80">
                          <FiMapPin className="mr-2 text-cyan-400" />
                          <span>
                            {[result.nom_vial, result.colonia].filter(Boolean).join(', ') || 'Dirección no disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && results && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="max-w-xl mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-4">No se encontraron resultados</h3>
                <p className="text-cyan-100/80">
                  Prueba con diferentes términos de búsqueda o ajusta los filtros.
                </p>
              </div>
            </motion.div>
          )}

          {!isLoading && results && results.length > 0 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} 
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 rounded-lg disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}

          {!hasSearched && !results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="max-w-xl mx-auto">
                <div className="text-6xl mb-4">🌊</div>
                <h3 className="text-xl font-semibold mb-4">Explora el directorio pesquero</h3>
                <p className="text-cyan-100/80">
                  Comienza buscando por nombre, ubicación o categoría. Utiliza los filtros para una búsqueda más precisa.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEmpresa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseEmpresaModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                onClick={handleCloseEmpresaModal}
              >
                <FiX size={24} />
              </button>

              <div className="p-8">
                <div className="flex items-start mb-6">
                  <div className="p-4 bg-cyan-400/10 rounded-xl mr-4">
                    <FiAnchor className="text-cyan-400" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEmpresa.nom_estab}</h2>
                    <p className="text-cyan-400 font-medium">{selectedEmpresa.categoria}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/30 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiUser className="mr-2 text-cyan-400" />
                      Información General
                    </h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEmpresa.acronimo && (
                        <div>
                          <dt className="text-sm text-cyan-300">Acrónimo</dt>
                          <dd className="text-slate-300">{selectedEmpresa.acronimo}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm text-cyan-300">Representante</dt>
                        <dd className="text-slate-300">
                          {selectedEmpresa.nom_representante || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-cyan-300">Razón Social</dt>
                        <dd className="text-slate-300">
                          {selectedEmpresa.raz_social || 'N/A'}
                        </dd>
                      </div>
                      {selectedEmpresa.grupo_funcional && (
                        <div>
                          <dt className="text-sm text-cyan-300">Grupo Funcional</dt>
                          <dd className="text-slate-300">{selectedEmpresa.grupo_funcional}</dd>
                        </div>
                      )}
                      {selectedEmpresa.subgrupo_funcional && (
                        <div>
                          <dt className="text-sm text-cyan-300">Subgrupo Funcional</dt>
                          <dd className="text-slate-300">{selectedEmpresa.subgrupo_funcional}</dd>
                        </div>
                      )}
                      {selectedEmpresa.nombre_cientifico && (
                        <div>
                          <dt className="text-sm text-cyan-300">Nombre Científico</dt>
                          <dd className="text-slate-300">{selectedEmpresa.nombre_cientifico}</dd>
                        </div>
                      )}
                      {selectedEmpresa.nombre_comun && (
                        <div>
                          <dt className="text-sm text-cyan-300">Nombre Común</dt>
                          <dd className="text-slate-300">{selectedEmpresa.nombre_comun}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="bg-slate-800/30 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiMapPin className="mr-2 text-cyan-400" />
                      Ubicación
                    </h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-cyan-300">Dirección</dt>
                        <dd className="text-slate-300">
                          {[
                            selectedEmpresa.nom_vial,
                            selectedEmpresa.numero_ext,
                            selectedEmpresa.colonia
                          ].filter(Boolean).join(', ')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-cyan-300">Localidad/Manzana</dt>
                        <dd className="text-slate-300">
                          {[selectedEmpresa.localidad, selectedEmpresa.manzana]
                            .filter(Boolean).join(' - ')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-cyan-300">Municipio/Estado</dt>
                        <dd className="text-slate-300">
                          {selectedEmpresa.municipio}, {selectedEmpresa.estado}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-cyan-300">Código Postal</dt>
                        <dd className="text-slate-300">
                          {selectedEmpresa.cod_postal || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-cyan-300">Coordenadas</dt>
                        <dd className="text-slate-300">
                          {selectedEmpresa.latitud}, {selectedEmpresa.longitud}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {(selectedEmpresa.especies_cientificas || selectedEmpresa.especies_comunes) && (
                    <div className="bg-slate-800/30 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Especies</h3>
                      <div className="space-y-2">
                        {selectedEmpresa.especies_cientificas && (
                          <p className="text-slate-300">
                            <span className="text-cyan-300">Científicas: </span>
                            {selectedEmpresa.especies_cientificas.join(', ') || 'N/A'}
                          </p>
                        )}
                        {selectedEmpresa.especies_comunes && (
                          <p className="text-slate-300">
                            <span className="text-cyan-300">Comunes: </span>
                            {selectedEmpresa.especies_comunes.join(', ') || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800/30 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Medios de Contacto</h3>
                    {[selectedEmpresa.www, selectedEmpresa.facebook, 
                      selectedEmpresa.linkedin, selectedEmpresa.instagram,
                      selectedEmpresa.twitter, selectedEmpresa.telegram,
                      selectedEmpresa.youtube, selectedEmpresa.telefono,
                      selectedEmpresa.correoelec].some(Boolean) ? (
                      <ul className="space-y-2">
                        {selectedEmpresa.www && (
                          <li className="text-slate-300">Web: {selectedEmpresa.www}</li>
                        )}
                        {selectedEmpresa.facebook && (
                          <li className="text-slate-300">Facebook: {selectedEmpresa.facebook}</li>
                        )}
                        {selectedEmpresa.linkedin && (
                          <li className="text-slate-300">LinkedIn: {selectedEmpresa.linkedin}</li>
                        )}
                        {selectedEmpresa.instagram && (
                          <li className="text-slate-300">Instagram: {selectedEmpresa.instagram}</li>
                        )}
                        {selectedEmpresa.twitter && (
                          <li className="text-slate-300">Twitter: {selectedEmpresa.twitter}</li>
                        )}
                        {selectedEmpresa.telegram && (
                          <li className="text-slate-300">Telegram: {selectedEmpresa.telegram}</li>
                        )}
                        {selectedEmpresa.youtube && (
                          <li className="text-slate-300">YouTube: {selectedEmpresa.youtube}</li>
                        )}
                        {selectedEmpresa.telefono && (
                          <li className="text-slate-300">Teléfono: {selectedEmpresa.telefono}</li>
                        )}
                        {selectedEmpresa.correoelec && (
                          <li className="text-slate-300">Email: {selectedEmpresa.correoelec}</li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-slate-400 italic">No tienen formas de contacto registradas</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilterModal && (
          <FilterModal
            filters={filters}
            initialSelected={{
              raz_social: activeFilters.raz_social,
              categoria: activeFilters.categoria,
              estado: activeFilters.estado,
              contacto: activeFilters.contacto
            }}
            onApply={handleApplyFilters}
            onClose={() => setShowFilterModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Directorio;