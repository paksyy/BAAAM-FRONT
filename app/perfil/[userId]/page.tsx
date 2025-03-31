'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentEmployment?: string;
  company?: string;
  position?: string;
  // Puedes agregar más campos si es necesario
}

export default function ProfilePage() {
  const { userId } = useParams() as { userId: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/user/profile/${userId}`, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-red-500">Perfil no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado con fondo degradado y avatar */}
      <header className="bg-gradient-to-r from-cyan-500 to-blue-500 py-12">
        <div className="max-w-4xl mx-auto px-4 flex items-center space-x-6">
          <div className="relative w-24 h-24">
            <Image
              src="/default-avatar.png"
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
            <p className="text-white/90">{profile.email}</p>
          </div>
        </div>
      </header>

      {/* Información del perfil */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Información del Perfil</h2>
          <div className="space-y-4">
            <div>
              <span className="block text-gray-600 font-medium">Empleo Actual:</span>
              <span className="block text-gray-800">{profile.currentEmployment || 'No especificado'}</span>
            </div>
            <div>
              <span className="block text-gray-600 font-medium">Empresa / Institución:</span>
              <span className="block text-gray-800">{profile.company || 'No especificado'}</span>
            </div>
            <div>
              <span className="block text-gray-600 font-medium">Puesto:</span>
              <span className="block text-gray-800">{profile.position || 'No especificado'}</span>
            </div>
            {/* Agrega más secciones según lo que quieras mostrar */}
          </div>
        </div>
      </main>
    </div>
  );
}
