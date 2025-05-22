'use client';
import { useState, useEffect, useCallback } from 'react';
import PostCard, { Post } from './PostCard';
import FilterBar from './FilterBar';

interface FeedPostsProps {
    initialFilters?: {
      userId?: string;
      sort?: 'newest' | 'likes';
      tag?: string;
    };
  }
export default function FeedPosts({ initialFilters }: FeedPostsProps) {
  const [filters, setFilters] = useState<{ 
    q?: string; 
    tag?: string; 
    sort?: 'newest' | 'likes';
    userId?: string;
  }>(initialFilters || {});

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (resetPage: boolean = true) => {
    try {
      setLoading(true);
      setError('');
      
      const currentPage = resetPage ? 1 : page;
      const baseUrl = filters.userId 
        ? `${process.env.NEXT_PUBLIC_API_BASE}/api/user/${filters.userId}/posts`
        : `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/posts`;
      
      const url = new URL(baseUrl);
      
      // Parámetros comunes
      url.searchParams.set('page', currentPage.toString());
      url.searchParams.set('limit', '10');
      if (filters.sort) url.searchParams.set('sort', filters.sort);
      if (filters.tag) url.searchParams.set('tag', filters.tag);

      const res = await fetch(url.toString(), { credentials: 'include' });
      
      if (!res.ok) throw new Error('Error al cargar publicaciones');
      
      const data = await res.json();
      
      if (resetPage) {
        setPosts(data);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 10);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load(true);
  }, [filters]);

  const handleVentanillaToggle = () => {
    setFilters(prev => ({
      ...prev,
      tag: prev.tag === 'ventanilla para mujeres' ? undefined : 'ventanilla para mujeres'
    }));
  };

  return (
    <div className="space-y-8">
      <FilterBar
        sort={filters.sort}
        ventanillaActive={filters.tag === 'ventanilla para mujeres'}
        selectedTag={filters.tag === 'ventanilla para mujeres' ? undefined : filters.tag}
        onSortChange={(sort) => setFilters(prev => ({ ...prev, sort }))}
        onVentanillaToggle={handleVentanillaToggle}
        onTagChange={(tag) => setFilters(prev => ({ ...prev, tag }))}
      />

      {/* Estado de error */}
              {error && (
                <div className="bg-red-600/20 border border-red-600/50 p-4 rounded-xl">
                  <p className="text-red-200">{error}</p>
                  <button 
                    onClick={() => load(true)}
                    className="mt-2 text-sm text-cyan-400 hover:underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              
              {/* Estado de carga inicial */}
              {loading && posts.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50 text-center">
                  <p className="text-slate-400">
                    No hay publicaciones que coincidan con tu búsqueda
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6">
                    {posts.map(p => (
                      <PostCard
                        key={p.id}
                        post={{ ...p, tags: Array.isArray(p.tags) ? p.tags : [] }}
                      />
                    ))}
                  </div>
                  
                  {/* Botón de cargar más */}
                  {hasMore && (
                    <div className="flex justify-center pt-4 pb-8">
                      <button
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg ${
                          loading
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                        }`}
                      >
                        {loading ? 'Cargando...' : 'Cargar más'}
                      </button>
                    </div>
                  )}
                </>
              )}
    </div>
  );
}