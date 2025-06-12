'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PostComposer from '@/components/forum/PostComposer';
import PostCard, { Post } from '@/components/forum/PostCard';
import SearchPanel from '@/components/forum/SearchPanel';
import FilterBar from '@/components/forum/FilterBar';
import TopCollaborators from './TopCollaborators';

export default function ForoFeedClient() {
  /* ── estado ── */
  const [filters, setFilters] = useState<{
    q?: string;
    tag?: string;
    sort?: 'newest' | 'likes';
    ventanilla?: boolean;
  }>({});
  const [page, setPage]       = useState(1);
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [hasMore, setHasMore] = useState(true);

  /* persistencia */
  const [stateRestored, setStateRestored] = useState(false);
  const initRef = useRef(false);

  /* ── helpers ── */
  const buildURL = (pageNo: number) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE}/api/forum/posts`);
    url.searchParams.set('page', pageNo.toString());
    url.searchParams.set('limit', '10');
    if (filters.sort) url.searchParams.set('sort', filters.sort);
    if (filters.q)    url.searchParams.set('q',   filters.q);

    // Enviar múltiples tags separados por comas
    const tags: string[] = [];
    if (filters.ventanilla) tags.push('ventanilla para mujeres');
    if (filters.tag)        tags.push(filters.tag);

    if (tags.length) url.searchParams.set('tag', tags.join(','));
    return url;
  };

  const fetchPosts = useCallback(
    async (reset = true, overridePage?: number) => {
      setLoading(true);
      setError('');
      try {
        const nextPage = reset ? 1 : overridePage ?? page;
        const urlString = buildURL(nextPage).toString();
        
        // Debug: imprime la URL para verificar el formato
        console.log('Fetching posts with URL:', urlString);
        
        const res = await fetch(urlString, { credentials: 'include' });
        if (!res.ok) throw new Error('Error al cargar publicaciones');
        const data: Post[] = await res.json();

        if (reset) {
          setPosts(data);
          setPage(1);
        } else {
          setPosts(prev => {
            const merged = [...prev, ...data];
            return merged.filter((p, i, self) => i === self.findIndex(x => x.id === p.id));
          });
        }
        setHasMore(data.length === 10);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    },
    [filters, page]
  );

  /* ── persistencia en sessionStorage ── */
  const saveState = useCallback(() => {
    if (!stateRestored) return;
    sessionStorage.setItem(
      'foro-state',
      JSON.stringify({
        filters,
        page,
        posts,
        scrollY: window.scrollY,
        hasMore,
        ts: Date.now()
      })
    );
  }, [filters, page, posts, hasMore, stateRestored]);

  // restaurar una sola vez
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const cached = sessionStorage.getItem('foro-state');
    let freshNeeded = true;

    if (cached) {
      try {
        const { filters: f, page: p, posts: cachedPosts, scrollY, hasMore: hm, ts } = JSON.parse(cached);
        if (ts && Date.now() - ts < 30 * 60 * 1000 && cachedPosts?.length) {
          setFilters(f || {});
          setPage(p || 1);
          setPosts(cachedPosts);
          setHasMore(hm ?? true);
          setLoading(false);
          freshNeeded = false;
          requestAnimationFrame(() => setTimeout(() => window.scrollTo(0, scrollY ?? 0), 50));
        }
      } catch { /* ignore */ }
    }

    setStateRestored(true);
    if (freshNeeded) fetchPosts(true);
  }, [fetchPosts]);

  // guarda en cada cambio
  useEffect(saveState, [saveState]);
  useEffect(() => {
    const handler = () => saveState();
    window.addEventListener('beforeunload', handler);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveState();
    });
    return () => {
      saveState();
      window.removeEventListener('beforeunload', handler);
    };
  }, [saveState]);

  // recarga cuando cambian filtros
  useEffect(() => {
    if (stateRestored) fetchPosts(true);
  }, [filters, stateRestored, fetchPosts]);

  /* ── handlers ── */
  const handleVentanillaToggle = () => {
    setFilters(prev => ({ ...prev, ventanilla: !prev.ventanilla }));
  };

  const handleNewPost = () => {
    sessionStorage.removeItem('foro-state');
    fetchPosts(true);
  };

  const loadMore = () => fetchPosts(false, page + 1);

  /* ── UI ── */
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* panel izquierdo */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <SearchPanel onChange={o => setFilters(prev => ({ ...prev, ...o }))} />
        <div className="mt-4">
          <TopCollaborators activeFilters={{ tag: filters.tag, ventanillaActive: !!filters.ventanilla }} />
        </div>
      </div>

      {/* feed */}
      <div className="flex-1 space-y-8">
        <PostComposer onPublish={handleNewPost} />

        <FilterBar
          sort={filters.sort}
          ventanillaActive={!!filters.ventanilla}
          selectedTag={filters.tag}
          onSortChange={s => setFilters(prev => ({ ...prev, sort: s }))}
          onVentanillaToggle={handleVentanillaToggle}
          onTagChange={t => setFilters(prev => ({ ...prev, tag: t }))}
        />

        {/* estados */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 p-4 rounded-xl">
            <p className="text-red-200">{error}</p>
            <button onClick={() => fetchPosts(true)} className="mt-2 text-sm text-cyan-400 hover:underline">
              Reintentar
            </button>
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50 text-center">
            <p className="text-slate-400">No hay publicaciones que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {posts.map(p => (
                <PostCard key={p.id} post={{ ...p, tags: Array.isArray(p.tags) ? p.tags : [] }} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg ${
                    loading
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                  }`}
                >
                  {loading ? 'Cargando…' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}