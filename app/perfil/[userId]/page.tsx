'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiBriefcase, FiEdit, FiMapPin, FiPhone, FiGlobe,
  FiLinkedin, FiTwitter, FiGithub, FiMessageSquare, FiUserPlus,
  FiChevronRight, FiX, FiFileText, FiAward, FiZap
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Navbar from '../../../components/NavBar/Navbar';
import FeedPosts from '@/components/forum/FeedPosts';

/* ─────────────── Tipos ─────────────── */
interface UserProfile {
  id: string;
  name: string;
  email: string;
  contact_email?: string;
  avatar?: string;
  curriculum?: string;
  current_employment?: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  // karma ya no está aquí, se obtiene por separado
}

interface UserConnection {
  id: string;
  name: string;
  avatar?: string;
  position?: string;
  company?: string;
}

/* ───────────── Componente ───────────── */
export default function ProfilePage() {
  /* -------------- Hooks -------------- */
  const { userId } = useParams() as { userId: string };
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE!;

  /* -------------- State -------------- */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userKarma, setUserKarma] = useState<number>(0); // Estado para el karma

  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);

  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [isConnectionLoading, setIsConnectionLoading] = useState(false);
  const [isUserAdded, setIsUserAdded] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);

  /* ----------- Verificar sesión ----------- */
  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });
      if (!res.ok) router.replace('/login');
    })();
  }, [router, apiUrl]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });
      if (res.ok) setCurrentUserId((await res.json()).userId);
    })();
  }, [apiUrl]);

  /* -------------- Perfil -------------- */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setIsLoading(true);
      try {
        const r = await fetch(`${apiUrl}/user/profile/${userId}`, { credentials: 'include' });
        if (r.ok) setProfile(await r.json());
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId, apiUrl]);

  // Nuevo useEffect para obtener el karma del usuario desde el endpoint específico
  useEffect(() => {
    if (!userId) return;
    const fetchUserKarma = async () => {
      try {
        // Llama al nuevo endpoint específico para el karma del usuario
        const karmaResponse = await fetch(`${apiUrl}/user/karma/${userId}`, { credentials: 'include' });
        
        if (karmaResponse.ok) {
          const data = await karmaResponse.json();
          // Asumiendo que la respuesta es algo como { karma: 123 }
          setUserKarma(data.karma || 0);
        } else {
          console.error('Error al obtener el karma:', karmaResponse.statusText);
          setUserKarma(0); // Establecer a 0 si hay un error
        }
      } catch (error) {
        console.error('Fallo al obtener el karma:', error);
        setUserKarma(0);
      }
    };

    fetchUserKarma();
  }, [userId, apiUrl]);


  /* ----------- Publicaciones ----------- */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const r = await fetch(`${apiBase}/api/user/${userId}/posts`, { credentials: 'include' });
      if (r.ok) setPosts(await r.json());
    })();
  }, [userId, apiBase]);

  /* ------------- Conexiones ------------- */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setIsConnectionLoading(true);
      try {
        const r = await fetch(`${apiUrl}/user/connections/${userId}`, { credentials: 'include' });
        if (r.ok) setConnections((await r.json()).connections);

        if (currentUserId && currentUserId !== userId) {
          const ck = await fetch(`${apiUrl}/user/check-connection/${userId}`, { credentials: 'include' });
          if (ck.ok) setIsUserAdded((await ck.json()).isConnected);
        }
      } finally {
        setIsConnectionLoading(false);
      }
    })();
  }, [userId, currentUserId, apiUrl]);

  /* -------------- Helpers -------------- */
  const isOwner = profile && profile.id === currentUserId;

  const handleInputChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setNewAvatar(e.target.files[0]);
  };

  const handleCurriculumChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCurriculumFile(e.target.files[0]);
  };

  const startEditing = () => {
    if (!profile) return;
    setEditData({
      name: profile.name,
      contact_email: profile.contact_email,
      current_employment: profile.current_employment,
      company: profile.company,
      position: profile.position,
      phone: profile.phone,
      website: profile.website,
      linkedin: profile.linkedin,
      twitter: profile.twitter,
      github: profile.github,
      bio: profile.bio,
      location: profile.location,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
    setNewAvatar(null);
    setCurriculumFile(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(editData).forEach(([k, v]) => v != null && fd.append(k, String(v)));
      if (newAvatar) fd.append('avatar', newAvatar);
      if (curriculumFile) fd.append('curriculum', curriculumFile);

      const r = await fetch(`${apiUrl}/user/profile/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        body: fd
      });

      if (r.ok) {
        setProfile(await r.json());
        cancelEditing();
        toast.success('Perfil actualizado');
      } else {
        toast.error('No se pudo actualizar');
      }
    } catch {
      toast.error('No se pudo actualizar');
    }
  };

  const handleToggleConnection = async () => {
    if (!currentUserId || currentUserId === userId) return;
    const method = isUserAdded ? 'DELETE' : 'POST';
    const r = await fetch(`${apiUrl}/user/connections/${userId}`, {
      method,
      credentials: 'include'
    });

    if (r.ok) {
      setIsUserAdded(!isUserAdded);
      toast.success(isUserAdded ? 'Usuario eliminado' : 'Usuario agregado');

      // Refrescar conexiones
      const ref = await fetch(`${apiUrl}/user/connections/${userId}`, { credentials: 'include' });
      if (ref.ok) setConnections((await ref.json()).connections);
    }
  };

  const handleSendFeedback = () => {
    const s = encodeURIComponent('Comentarios sobre mi perfil');
    const b = encodeURIComponent(`Hola,\n\nQuiero enviar los siguientes comentarios sobre mi perfil (ID: ${userId}):\n\n`);
    window.location.href = `mailto:baaam@uabc.edu.mx?subject=${s}&body=${b}`;
  };

  /**
   * Determina la insignia de karma basada en el valor.
   * @param karma El valor de karma del usuario.
   * @returns Un objeto con el emoji y la descripción de la insignia.
   */
  const getKarmaBadge = (karma: number) => {
    if (karma >= 1000) {
      return { emoji: '👑', description: 'Leyenda de la Comunidad' };
    } else if (karma >= 500) {
      return { emoji: '💎', description: 'Contribuidor Estelar' };
    } else if (karma >= 100) {
      return { emoji: '🌟', description: 'Maestro Impacto' };
    } else if (karma >= 10) {
      return { emoji: '✨', description: 'Colaborador Activo' };
    } else {
      return { emoji: '🌱', description: 'Semilla de la Comunidad' };
    }
  };

  /* --------- Pantallas de carga / error --------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xl text-cyan-400"
        >
          Cargando perfil…
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <p className="text-xl text-red-400">Perfil no encontrado.</p>
      </div>
    );
  }

  // Obtenemos la insignia del karma usando el estado `userKarma`
  const karmaBadge = getKarmaBadge(userKarma);

  /* -------------- Render -------------- */
  const visibleConnections = showAllConnections ? connections : connections.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />

      <div className="pt-16 px-4 lg:px-8 py-8">
        {/* ──────────── Encabezado ──────────── */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 py-12 rounded-2xl backdrop-blur-sm mb-8 border border-slate-700/50 relative"
        >
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} className="relative w-32 h-32 md:w-40 md:h-40">
              <img
                src={profile.avatar ? `${apiBase}${profile.avatar}` : '/default-avatar.png'}
                alt={profile.name}
                className="rounded-full object-cover border-4 border-cyan-400/30 shadow-xl w-full h-full"
              />
            </motion.div>

            {/* Nombre + datos básicos */}
            <div className="text-center md:text-left flex-grow">
              {/* Nombre */}
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name || ''}
                  onChange={handleInputChange}
                  className="text-3xl md:text-4xl font-bold bg-transparent border-b border-cyan-400 focus:outline-none text-white text-center md:text-left"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  {profile.name}
                </h1>
              )}

              {/* Karma e Insignia */}
              <div className="flex items-center justify-center md:justify-start mt-2 text-lg text-cyan-300">
                <FiZap className="text-purple-400 mr-2" />
                <span>Huella en la comunidad: {userKarma}</span> {/* Usa userKarma aquí */}
                <span className="ml-3 flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm font-semibold text-white">
                  {karmaBadge.emoji} {karmaBadge.description}
                </span>
              </div>

              {/* Redes sociales */}
              <div className="flex justify-center md:justify-start mt-4 space-x-4">
                {profile.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                    <FiLinkedin className="text-cyan-400 text-2xl hover:text-cyan-300 transition-colors" />
                  </a>
                )}
                {profile.twitter && (
                  <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                    <FiTwitter className="text-cyan-400 text-2xl hover:text-cyan-300 transition-colors" />
                  </a>
                )}
                {profile.github && (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                    <FiGithub className="text-cyan-400 text-2xl hover:text-cyan-300 transition-colors" />
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiGlobe className="text-cyan-400 text-2xl hover:text-cyan-300 transition-colors" />
                  </a>
                )}
              </div>

              {/* Puesto / Empresa */}
              {isEditing ? (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    name="position"
                    placeholder="Puesto"
                    value={editData.position || ''}
                    onChange={handleInputChange}
                    className="block bg-transparent border-b border-cyan-400 focus:outline-none text-lg text-cyan-300 placeholder:text-cyan-400/50"
                  />
                  <input
                    type="text"
                    name="company"
                    placeholder="Empresa / Institución"
                    value={editData.company || ''}
                    onChange={handleInputChange}
                    className="block bg-transparent border-b border-cyan-400 focus:outline-none text-lg text-cyan-300 placeholder:text-cyan-400/50"
                  />
                </div>
              ) : (
                profile.position && (
                  <p className="mt-2 text-lg text-cyan-300 font-medium">
                    {profile.position}{profile.company && ` en ${profile.company}`}
                  </p>
                )
              )}

              {/* Bio */}
              {!isEditing && profile.bio && (
                <p className="mt-4 max-w-2xl text-cyan-100/80">{profile.bio}</p>
              )}
              {isEditing && (
                <textarea
                  name="bio"
                  value={editData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Escribe tu biografía…"
                  rows={3}
                  className="mt-4 w-full bg-transparent border border-cyan-400 rounded-md p-3 text-base placeholder:text-cyan-400/50 text-cyan-100/80 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-vertical"
                />
              )}
            </div>

            {/* Botón editar / agregar */}
            <div className="flex flex-col items-center space-y-2">
              {isOwner ? (
                !isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEditing}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiEdit className="mr-2" /> Editar Perfil
                  </motion.button>
                )
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleConnection}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all ${
                    isUserAdded
                      ? 'bg-slate-700 text-red-400 hover:bg-slate-600'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900'
                  }`}
                >
                  {isUserAdded ? (
                    <>
                      <FiX className="mr-2" /> Eliminar
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="mr-2" /> Agregar
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        {/* ─────────── Formulario edición ─────────── */}
        {isOwner && isEditing && (
          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50 mb-8 space-y-6"
          >
            {/* Foto + Curriculum */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-cyan-300 font-medium block mb-2">Foto de perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full bg-slate-700 text-white p-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-400 file:text-slate-900 hover:file:bg-cyan-300"
                />
                {newAvatar && (
                  <p className="mt-2 text-sm text-cyan-300">Archivo seleccionado: {newAvatar.name}</p>
                )}
              </div>

              <div>
                <label className="text-cyan-300 font-medium block mb-2">Curriculum (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCurriculumChange}
                  className="w-full bg-slate-700 text-white p-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-400 file:text-slate-900 hover:file:bg-cyan-300"
                />
                {curriculumFile && (
                  <p className="mt-2 text-sm text-cyan-300">Archivo seleccionado: {curriculumFile.name}</p>
                )}
                {profile.curriculum && !curriculumFile && (
                  <p className="mt-2 text-sm text-cyan-400">
                    Curriculum actual: <a href={`${apiBase}${profile.curriculum}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">Ver PDF</a>
                  </p>
                )}
              </div>
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Situación laboral */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">Situación Laboral Actual</label>
                <select
                  name="current_employment"
                  value={editData.current_employment || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Institución">Institución</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Gobierno">Gobierno</option>
                  <option value="Producto">Producto</option>
                </select>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="+52 xxx xxx xxxx"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>

              {/* Correo de contacto */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">Correo de Contacto</label>
                <input
                  type="email"
                  name="contact_email"
                  value={editData.contact_email || ''}
                  onChange={handleInputChange}
                  placeholder="contacto@ejemplo.com"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>

              {/* Sitio web */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">Sitio Web</label>
                <input
                  type="url"
                  name="website"
                  value={editData.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://mi-sitio.com"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">LinkedIn</label>
                <input
                  type="text"
                  name="linkedin"
                  value={editData.linkedin || ''}
                  onChange={handleInputChange}
                  placeholder="nombre-usuario"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">Twitter</label>
                <input
                  type="text"
                  name="twitter"
                  value={editData.twitter || ''}
                  onChange={handleInputChange}
                  placeholder="@usuario"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={editData.github || ''}
                  onChange={handleInputChange}
                  placeholder="nombre-usuario"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-cyan-300 font-medium mb-2">Ubicación</label>
                <input
                  type="text"
                  name="location"
                  value={editData.location || ''}
                  onChange={handleInputChange}
                  placeholder="Ciudad, País"
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-cyan-400/50"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg font-medium hover:from-cyan-500 hover:to-blue-600 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.form>
        )}

        {/* ─────────── Vista solo lectura ─────────── */}
        {!isEditing && (
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* ╭────────── Columna izquierda (experiencia + posts) ──────────╮ */}
            <div className="lg:col-span-2 space-y-6">
              {/* Experiencia */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-cyan-400">
                  <FiBriefcase className="mr-2" /> Experiencia Profesional
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Situación Laboral Actual</h3>
                    <p className="text-cyan-100/80">{profile.current_employment || 'No especificado'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Empresa/Institución</h3>
                    <p className="text-cyan-100/80">{profile.company || 'No especificado'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Puesto</h3>
                    <p className="text-cyan-100/80">{profile.position || 'No especificado'}</p>
                  </div>
                  <div>
                    {/* Curriculum link también en esta sección */}
                    {profile.curriculum && (
                      <a
                        href={`${apiBase}${profile.curriculum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <FiFileText className="mr-2" /> Ver Curriculum (PDF)
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Posts del usuario */}
              {posts.length > 0 && (
                <div className="mt-8">
                  <FeedPosts initialFilters={{ userId: profile.id }} />
                </div>
              )}
            </div>

            {/* ╭────────── Columna derecha (contacto + conexiones + feedback) ──────────╮ */}
            <div className="space-y-6">
              {/* Contacto */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-cyan-400">
                  <FiUser className="mr-2" /> Información de Contacto
                </h2>
                <div className="space-y-4">
                  {profile.location && (
                    <div className="flex items-start">
                      <FiMapPin className="text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-cyan-100/80">{profile.location}</p>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-start">
                      <FiPhone className="text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-cyan-100/80">{profile.phone}</p>
                    </div>
                  )}
                  <div className="flex items-start">
                    <FiMail className="text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-cyan-100/80">
                      {profile.contact_email || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conexiones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-cyan-400 flex items-center">
                    <FiUserPlus className="mr-2" /> Conexiones ({connections.length})
                  </h2>
                  {connections.length > 6 && (
                    <button
                      onClick={() => setShowAllConnections(!showAllConnections)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
                    >
                      {showAllConnections ? 'Ver menos' : 'Ver más'}
                      <FiChevronRight className={`ml-1 transform transition-transform ${showAllConnections ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>

                {isConnectionLoading ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-lg text-cyan-400"
                    >
                      Cargando conexiones…
                    </motion.div>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-cyan-100/60">No hay conexiones aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {visibleConnections.map(c => (
                      <motion.div
                        key={c.id}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                      >
                        <a href={`/perfil/${c.id}`} className="block w-full">
                          <div className="w-16 h-16 mb-3 mx-auto relative">
                            <img
                              src={c.avatar ? `${apiBase}${c.avatar}` : '/default-avatar.png'}
                              alt={c.name}
                              className="rounded-full w-full h-full object-cover border-2 border-cyan-400/30"
                            />
                          </div>
                          <p className="text-cyan-100 font-medium text-sm truncate w-full mb-1">
                            {c.name}
                          </p>
                          {c.position && (
                            <p className="text-cyan-300/70 text-xs truncate w-full">
                              {c.position}
                            </p>
                          )}
                          {c.company && (
                            <p className="text-cyan-400/60 text-xs truncate w-full">
                              {c.company}
                            </p>
                          )}
                        </a>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Feedback */}
              {isOwner && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center text-cyan-400">
                    <FiMessageSquare className="mr-2" /> Comentarios
                  </h2>
                  <p className="text-cyan-100/80 mb-4">
                    ¿Tienes algún comentario o sugerencia sobre la plataforma? Háznoslo saber.
                  </p>
                  <button
                    onClick={handleSendFeedback}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-medium rounded-lg flex items-center justify-center hover:from-cyan-500 hover:to-blue-600 transition-colors shadow-lg"
                  >
                    <FiMessageSquare className="mr-2" /> Enviar Comentarios
                  </button>
                </div>
              )}
            </div>
          </motion.main>
        )}
      </div>
    </div>
  );
}