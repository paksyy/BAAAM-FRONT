'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiActivity, FiZap } from 'react-icons/fi';
import { resolveAvatar } from '@/utils/resolveAvatar';
import Link from 'next/link'; // Importa Link
import { useRouter } from 'next/navigation'; // Importa useRouter para navegación programática

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  position?: string;
  total_impacto: number;
}

interface Props {
  activeFilters: {
    tag?: string;
    ventanillaActive?: boolean;
  };
}

export default function TopCollaborators({ activeFilters }: Props) {
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const router = useRouter(); // Inicializa el router

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeFilters.tag) params.set('tag', activeFilters.tag);
        if (activeFilters.ventanillaActive) params.set('ventanilla', 'true');

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/user/top-collaborators?${params}`
        );
        const data = await res.json();
        setCollaborators(data);
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilters]);

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <div className="flex items-center gap-2 mb-4 text-cyan-300">
        <FiZap className="text-purple-400" />
        <h2 className="text-xl font-semibold">
          Huella en la comunidad {activeFilters.tag && `en #${activeFilters.tag}`}
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {collaborators.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg transition-colors"
            >
              <div className="w-6 text-center">
                <span className={`text-sm ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-slate-300' :
                  index === 2 ? 'text-amber-600' : 'text-slate-400'
                }`}>
                  {index + 1}
                </span>
              </div>

              {/* Enlace para la imagen y el nombre */}
              <Link
                href={`/perfil/${user.id}`}
                onClick={(e) => {
                  e.preventDefault(); // Previene la navegación por defecto del Link
                  router.push(`/perfil/${user.id}`); // Navegación controlada
                }}
                className="flex items-center gap-3 group" // Puedes aplicar estilos de hover aquí si deseas que todo el bloque sea interactivo
              >
                <Image
                  src={resolveAvatar(user.avatar)}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400/20"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-cyan-300 truncate">
                    {user.name}
                  </h3>
                  {user.position && (
                    <p className="text-xs text-slate-400 truncate">
                      {user.position}
                    </p>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1 text-xs font-mono bg-slate-800/50 px-2 py-1 rounded-full">
                <FiActivity className="text-green-400" />
                <span className="text-cyan-300">{user.total_impacto}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && collaborators.length === 0 && (
        <div className="text-center py-4 text-slate-400">
          No hay datos de impacto disponibles
        </div>
      )}
    </div>
  );
}