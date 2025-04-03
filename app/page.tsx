'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/perfil/${data.userId}`);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error comprobando sesión:', error);
        router.push('/login');
      }
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-cyan-300">
      Cargando...
    </div>
  );
}
