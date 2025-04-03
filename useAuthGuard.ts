import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
}
