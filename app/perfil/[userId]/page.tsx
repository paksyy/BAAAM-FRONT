'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiBriefcase, FiEdit, FiMapPin, FiPhone, FiGlobe, 
  FiLinkedin, FiTwitter, FiGithub, FiMessageSquare, FiUserPlus, FiChevronRight, FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Navbar from '../../../components/NavBar/Navbar';
import FeedPosts from '@/components/forum/FeedPosts';

interface UserProfile {
  id: string;
  name: string;
  email: string; // Correo de login (no editable)
  contact_email?: string; // Correo de contacto (editable)
  avatar?: string;
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
}

interface UserConnection {
  id: string;
  name: string;
  avatar?: string;
  position?: string;
  company?: string;
}

export default function ProfilePage() {
  const { userId } = useParams() as { userId: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // Para edición: copiamos los datos del perfil a un state editable
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  // Para la foto nueva, guardamos el archivo
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  // Para usuarios agregados
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [showAllConnections, setShowAllConnections] = useState<boolean>(false);
  const [isConnectionLoading, setIsConnectionLoading] = useState<boolean>(false);
  const [isUserAdded, setIsUserAdded] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include',
        });
  
        if (!res.ok) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        router.replace('/login');
      }
    };
  
    checkSession();
  }, [router]);

  // Fetch del perfil a mostrar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${apiUrl}/user/profile/${userId}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          console.error('Perfil no encontrado o no autenticado');
        }
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Fetch del usuario autenticado (para determinar si es el dueño)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.userId);
        } else {
          window.location.href = '/login'; // ⬅ redirige si no hay sesión
        }
      } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        window.location.href = '/login'; // ⬅ también si hay error
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
      
      try {
        // Asegúrate de que NEXT_PUBLIC_API_BASE no incluya /api al final
        const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/user/${userId}/posts`;
        console.log('Intentando cargar publicaciones desde:', url);
        
        const res = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Para debugging, muestra el status y el texto de respuesta
        console.log('Status de respuesta:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Datos de publicaciones recibidos:', data);
          if (Array.isArray(data)) {
            setPosts(data);
          } else {
            console.error('Los datos recibidos no son un array:', data);
            setPosts([]);
          }
        } else {
          // Intentar obtener el mensaje de error del servidor
          const errorText = await res.text().catch(() => 'No se pudo leer el error');
          console.error(`Error al cargar publicaciones (${res.status}):`, errorText);
        }
      } catch (error) {
        console.error('Excepción al obtener publicaciones:', error);
      }
    };
    
    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);
  
  // Fetch de usuarios agregados
  useEffect(() => {
    const fetchUserConnections = async () => {
      if (!currentUserId || !userId) return;
      
      try {
        setIsConnectionLoading(true);
        const res = await fetch(`${apiUrl}/user/connections/${userId}`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setConnections(data.connections);
          
          // Verificar si el usuario actual ya tiene agregado a este perfil
          if (userId !== currentUserId) {
            const checkRes = await fetch(`${apiUrl}/user/check-connection/${userId}`, {
              credentials: 'include'
            });
            
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              setIsUserAdded(checkData.isConnected);
            }
          }
        }
      } catch (error) {
        console.error('Error obteniendo conexiones:', error);
      } finally {
        setIsConnectionLoading(false);
      }
    };
    
    fetchUserConnections();
  }, [currentUserId, userId]);

  // Calcula si el usuario que ve el perfil es su dueño
  const isOwner = profile && currentUserId && profile.id === currentUserId;

  // Manejo de cambios en los inputs de edición
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar subida de avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
    }
  };

  // Iniciar modo edición: copiamos datos del perfil
  const startEditing = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        // No permitimos editar el correo de login, pero sí el de contacto
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
    }
  };

  // Cancelar edición: limpiar estados
  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
    setNewAvatar(null);
  };

  // Guardar cambios (actualizar perfil)
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // Agregar datos editables
      Object.entries(editData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      // Si hay una nueva foto, agregarla
      if (newAvatar) {
        formData.append('avatar', newAvatar);
      }
      // Realiza la petición PUT al endpoint de actualización de perfil
      const res = await fetch(`${apiUrl}/user/profile/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        setNewAvatar(null);
      } else {
        console.error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error en la actualización:', error);
    }
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent('Comentarios sobre mi perfil');
    const body = encodeURIComponent(`Hola,\n\nQuiero enviar los siguientes comentarios sobre mi perfil (ID: ${userId}):\n\n`);
    window.location.href = `mailto:baaam@uabc.edu.mx?subject=${subject}&body=${body}`;
  };

  // Función para agregar o quitar un usuario
  const handleToggleConnection = async () => {
    if (!currentUserId || !userId || currentUserId === userId) return;
    
    try {
      const method = isUserAdded ? 'DELETE' : 'POST';
      const res = await fetch(`${apiUrl}/user/connections/${userId}`, {
        method: method,
        credentials: 'include',
      });
      
      if (res.ok) {
        setIsUserAdded(!isUserAdded);
        toast.success(isUserAdded ? 'Usuario eliminado' : 'Usuario agregado');
        
        const connRes = await fetch(`${apiUrl}/user/connections/${userId}`, {
          credentials: 'include'
        });
        
        if (connRes.ok) {
          const data = await connRes.json();
          setConnections(data.connections);
        }
      } else {
        // Manejo de errores de la respuesta HTTP
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al gestionar conexión:', error);
      
      // Manejo seguro del tipo unknown
      if (error instanceof Error) {
        toast.error(error.message || 'Error al conectar con el servidor');
      } else {
        toast.error('Ocurrió un error desconocido');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xl text-cyan-400"
        >
          Cargando perfil...
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Filtrar conexiones para mostrar
  const visibleConnections = showAllConnections ? connections : connections.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />
      
      {/* Main content */}
      <div className="pt-16 px-4 lg:px-8 py-8">
        {/* Encabezado con fondo degradado y avatar */}
        <motion.header 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 py-12 rounded-2xl backdrop-blur-sm mb-8 border border-slate-700/50 relative"
        >
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <motion.div whileHover={{ scale: 1.05 }} className="relative w-32 h-32 md:w-40 md:h-40">
              <img
                src={profile.avatar ? `${apiBase}${profile.avatar}` : "/default-avatar.png"}
                alt=""
                className="rounded-full object-cover border-4 border-cyan-400/30 shadow-xl w-full h-full"
              />
            </motion.div>
            <div className="text-center md:text-left flex-grow">
              {isEditing ? (
                <input 
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  className="text-3xl md:text-4xl font-bold bg-transparent border-b border-cyan-400 focus:outline-none text-white text-center md:text-left"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  {profile.name}
                </h1>
              )}
              {/* Mostramos los iconos de redes sociales debajo de la foto */}
              <div className="flex justify-center md:justify-start mt-4 space-x-4">
                {profile.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                    <FiLinkedin className="text-cyan-400 text-2xl hover:text-cyan-300" />
                  </a>
                )}
                {profile.twitter && (
                  <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                    <FiTwitter className="text-cyan-400 text-2xl hover:text-cyan-300" />
                  </a>
                )}
                {profile.github && (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                    <FiGithub className="text-cyan-400 text-2xl hover:text-cyan-300" />
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer">
                    <FiGlobe className="text-cyan-400 text-2xl hover:text-cyan-300" />
                  </a>
                )}
              </div>
              {isEditing ? (
                <>
                  <input 
                    type="text"
                    name="position"
                    value={editData.position || ''}
                    onChange={handleInputChange}
                    placeholder="Puesto"
                    className="mt-2 bg-transparent border-b border-cyan-400 focus:outline-none text-lg text-cyan-300"
                  />
                  <input 
                    type="text"
                    name="company"
                    value={editData.company || ''}
                    onChange={handleInputChange}
                    placeholder="Empresa / Institución"
                    className="mt-2 bg-transparent border-b border-cyan-400 focus:outline-none text-lg text-cyan-300"
                  />
                </>
              ) : (
                profile.position && (
                  <p className="mt-2 text-lg text-cyan-300 font-medium">
                    {profile.position}{profile.company && ` en ${profile.company}`}
                  </p>
                )
              )}
              {profile.bio && !isEditing && (
                <p className="mt-4 max-w-2xl text-cyan-100/80">
                  {profile.bio}
                </p>
              )}
              {isEditing && (
                <textarea
                  name="bio"
                  value={editData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Escribe tu biografía..."
                  className="mt-4 w-full bg-transparent border border-cyan-400 rounded-md p-3 text-base placeholder:text-cyan-400/50 text-cyan-100/80 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              )}
            </div>
            
            {/* Botones de acción: Editar perfil o Agregar usuario */}
            <div className="flex flex-col items-center space-y-2">
              {isOwner ? (
                !isEditing && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEditing}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiEdit className="mr-2" />
                    Editar Perfil
                  </motion.button>
                )
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleConnection}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all ${
                    isUserAdded 
                      ? 'bg-slate-700 text-red-400' 
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900'
                  }`}
                >
                  {isUserAdded ? (
                    <>
                      <FiX className="mr-2" />
                      Eliminar Usuario
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="mr-2" />
                      Agregar Usuario
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Formulario de edición (solo para el dueño y en modo edición) */}
        {isOwner && isEditing && (
          <motion.form 
            onSubmit={handleSave}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-6xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50 mb-8 space-y-6"
          >
            <div className="flex flex-col gap-4">
              <label className="text-cyan-300 font-medium">Cambiar foto de perfil:</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="bg-slate-700 text-white p-2 rounded"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-cyan-300 font-medium">Situación Laboral Actual</label>
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
              <div>
                <label className="block text-cyan-300 font-medium">Teléfono</label>
                <input 
                  type="text"
                  name="phone"
                  value={editData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-medium">Correo de Contacto</label>
                <input 
                  type="email"
                  name="contact_email"
                  value={editData.contact_email || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-medium">Sitio Web</label>
                <input 
                  type="text"
                  name="website"
                  value={editData.website || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-medium">LinkedIn</label>
                <input 
                  type="text"
                  name="linkedin"
                  value={editData.linkedin || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-medium">Twitter</label>
                <input 
                  type="text"
                  name="twitter"
                  value={editData.twitter || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-medium">GitHub</label>
                <input 
                  type="text"
                  name="github"
                  value={editData.github || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-medium">Ubicación</label>
                <input 
                  type="text"
                  name="location"
                  value={editData.location || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 p-3 rounded-lg border-2 border-cyan-400/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button 
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg"
              >
                Guardar
              </button>
            </div>
          </motion.form>
        )}

        {/* Sección de información del perfil (solo lectura) */}
        {!isEditing && (
          <motion.main 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Columna izquierda - Información básica y publicaciones */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sección de empleo */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center text-cyan-400">
                    <FiBriefcase className="mr-2" />
                    Experiencia Profesional
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">Situación Laboral Actual</h3>
                      <p className="text-cyan-100/80">
                        {profile.current_employment || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Empresa/Institución</h3>
                      <p className="text-cyan-100/80">
                        {profile.company || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Puesto</h3>
                      <p className="text-cyan-100/80">
                        {profile.position || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección de publicaciones */}
                {posts.length > 0 ? (
                  <div className="mt-8">
                      <FeedPosts initialFilters={{ userId: profile.id }} />
                    </div>
                  ) : (
                  <p className="mt-4 text-cyan-100/50"></p>
                )}
              </div>
            {/* Columna derecha - Información de contacto */}
            <div className="space-y-6">
              {/* Sección de contacto */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-semibold mb-6 flex items-center text-cyan-400">
                  <FiUser className="mr-2" />
                  Información de Contacto
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
                  {profile.contact_email ? (
                    <div className="flex items-start">
                      <FiMail className="text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-cyan-100/80">{profile.contact_email}</p>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <FiMail className="text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-cyan-100/80">No especificado</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Sección de usuarios agregados (para todos los perfiles) */}
              {connections.length >= 0 && (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="max-w-6xl mx-auto mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-cyan-400 flex items-center">
                      <FiUserPlus className="mr-2" />
                      Usuarios Agregados ({connections.length})
                    </h2>
                    {connections.length > 6 && (
                      <button 
                        onClick={() => setShowAllConnections(!showAllConnections)} 
                        className="text-cyan-400 hover:text-cyan-300 flex items-center"
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
                        Cargando conexiones...
                      </motion.div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-1 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                      {visibleConnections.map((connection) => (
                        <motion.div
                          key={connection.id}
                          whileHover={{ scale: 1.05 }}
                          className="flex flex-col items-center text-center p-2"
                        >
                          <a href={`/perfil/${connection.id}`} className="block">
                            <div className="w-12 h-12 mb-3 mx-auto relative"> {/* Reducimos aún más el tamaño de la imagen */}
                              <img
                                src={connection.avatar ? `${apiBase}${connection.avatar}` : "/default-avatar.png"}
                                alt={connection.name}
                                className="rounded-full w-full h-full object-cover border-2 border-cyan-400/30"
                              />
                            </div>
                            <p className="text-cyan-100 font-medium text-xs truncate w-full">{connection.name}</p> {/* Reducimos el tamaño del texto */}
                            {connection.position && (
                              <p className="text-cyan-300/70 text-xs truncate w-full">{connection.position}</p>
                            )}
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {/* Botón de enviar comentarios (solo para el dueño del perfil) */}
              {isOwner && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center text-cyan-400">
                    <FiMessageSquare className="mr-2" />
                    Comentarios
                  </h2>
                  <p className="text-cyan-100/80 mb-4">
                    ¿Tienes algún comentario o sugerencia sobre la plataforma? Háznoslo saber.
                  </p>
                  <button
                    onClick={handleSendFeedback}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-medium rounded-lg flex items-center justify-center hover:from-cyan-500 hover:to-blue-600 transition-colors shadow-lg"
                  >
                    <FiMessageSquare className="mr-2" />
                    Enviar Comentarios
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
