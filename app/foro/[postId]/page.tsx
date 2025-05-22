'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/NavBar/Navbar';
import { FiThumbsUp, FiThumbsDown, FiArrowLeft, FiUser, FiMessageCircle } from 'react-icons/fi';
import Comment, { CommentModel } from '@/components/forum/Comment';
import { Post } from '@/components/forum/PostCard';
import { resolveAvatar } from '@/utils/resolveAvatar';

export default function PostDetail() {
  const { postId } = useParams() as { postId: string };
  const router     = useRouter();
  const [post, setPost]         = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [text, setText]         = useState('');
  const [busy, setBusy]         = useState(false);
  const [liked, setLiked]       = useState(false);
  const [likes, setLikes]       = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [dislikes, setDislikes] = useState(0);

  useEffect(() => {
    async function load() {
      // Carga el post
      const p = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/posts/${postId}`,
        { credentials: 'include' }
      );
      if (!p.ok) return;
      const pj: Post = await p.json();
      setPost(pj);
      setLiked(!!pj.liked_by_user);
      setDisliked(!!pj.disliked_by_user);
      setLikes(pj.likes);
      setDislikes(pj.dislikes);
      // Carga los comentarios
      const c = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/posts/${postId}/comments`,
        { credentials: 'include' }
      );
      if (c.ok) setComments(await c.json());
    }
    load();
  }, [postId]);

  const toggleLike = async () => {
    if (!post) return;
    const method = liked ? 'DELETE' : 'POST';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/post/${postId}/like`,
      { method, credentials: 'include' }
    );
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setDisliked(data.disliked || false);
    setLikes(data.likes);
    setDislikes(data.dislikes);
  };

  const toggleDislike = async () => {
    if (!post) return;
    const method = disliked ? 'DELETE' : 'POST';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/post/${postId}/dislike`,
      { method, credentials: 'include' }
    );
    if (!res.ok) return;
    const data = await res.json();
    setDisliked(data.disliked);
    setLiked(data.liked || false);
    setDislikes(data.dislikes);
    setLikes(data.likes);
  };
  if (!post) return null;

  const sortedTags = [...post.tags].sort((a, b) => {
    if (a === 'ventanilla para mujeres') return -1;
    if (b === 'ventanilla para mujeres') return 1;
    return a.localeCompare(b);
  });

  const publishComment = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/posts/${postId}/comments`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      }
    );
    if (res.ok) {
      const nc = await res.json();
      setComments(prev => [...prev, nc]);
      setText('');
    }
    setBusy(false);
  };

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />
      <div className="pt-24 px-4 lg:px-8 max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => router.push('/foro')}
          className="flex items-center text-cyan-400 hover:underline"
        >
          <FiArrowLeft className="mr-1" /> Volver al foro
        </button>

        {/* Post con diseño idéntico al PostCard */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <Link href={`/perfil/${post.user_id}`} className="flex items-center gap-3 mb-3 group hover:bg-slate-700/30 p-2 rounded-lg transition-colors">
            <div className="relative">
              <Image
                src={resolveAvatar(post.profile_image)}
                alt={post.author}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/default-avatar.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="font-medium text-cyan-300">{post.author}</p>
                {post.position && (
                  <span className="text-xs text-slate-400">{post.position}</span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          </Link>

          <div className="block">
            <p className="whitespace-pre-line mb-4 hover:bg-slate-700/10 rounded-lg p-2 transition-colors">
              {post.content}
            </p>
            
            {post.image && (
              <div className="my-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE || ''}/uploads${post.image}`}
                  alt="Post image"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover max-h-64 w-full hover:brightness-110 transition-all"
                  unoptimized
                />
              </div>
            )}
          </div>

          {post.tags.length ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {sortedTags.map(t => (
                <span 
                  key={t} 
                  className={`px-3 py-1 text-xs rounded-full ${
                    t === 'ventanilla para mujeres'
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'bg-cyan-400/10 text-cyan-300'
                  }`}
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic mb-4">Sin etiquetas</p>
          )}

          <div className="flex items-center gap-4 text-base">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 ${liked ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              <FiThumbsUp className={liked ? 'fill-cyan-400' : ''} size={18} />
              {likes}
            </button>

            <button
              onClick={toggleDislike}
              className={`flex items-center gap-1 ${disliked ? 'text-rose-400' : 'text-slate-400'}`}
            >
              <FiThumbsDown className={disliked ? 'fill-rose-400' : ''} size={18} />
              {dislikes}
            </button>

            <div className="flex items-center gap-1 text-slate-400">
              <FiMessageCircle size={18} />
              {post.comments}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50" />
            </div>
            
            <div className="flex-1 space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Escribe un comentario..."
                className="w-full bg-transparent resize-none focus:outline-none placeholder:text-slate-500 text-slate-100"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  {280 - text.length} caracteres restantes
                </span>
                
                <button
                  onClick={publishComment}
                  disabled={busy || !text.trim()}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    busy || !text.trim()
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
                  }`}
                >
                  <FiMessageCircle />
                  {busy ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {comments.length ? (
            comments.map((c) => (
              <Comment 
                key={c.id} 
                comment={{ 
                  ...c,
                  disliked_by_user: c.disliked_by_user || false,
                  dislikes: c.dislikes || 0
                }} 
              />
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 rounded-xl border border-slate-700/50">
              Sé el primero en comentar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
