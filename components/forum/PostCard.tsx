'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiMessageCircle, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { resolveAvatar } from '@/utils/resolveAvatar';
import { useRouter } from 'next/navigation';  // Para Next.js 13+

export interface Post {
  id: number;
  author: string;
  profile_image?: string;
  content: string;
  position?: string;
  created_at: string;
  likes: number;
  dislikes: number;
  comments: number;
  tags: string[];
  image?: string; 
  liked_by_user?: boolean;
  disliked_by_user?: boolean;
  user_id: number; // Añadido para el enlace al perfil
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked_by_user || false);
  const [disliked, setDisliked] = useState(post.disliked_by_user || false);
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);
  const router = useRouter();

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const method = liked ? 'DELETE' : 'POST';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/post/${post.id}/like`,
      { method, credentials: 'include' }
    );
    
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
      
      // Si se da like, quitar dislike si estaba activo
      if (data.liked && disliked) {
        setDisliked(false);
        setDislikes(prev => prev - 1);
      }
    }
  };

  const toggleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/post/${post.id}/dislike`,
        { 
          method: disliked ? 'DELETE' : 'POST',
          credentials: 'include'
        }
      );
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cambiar dislike');
      }
      
      const data = await res.json();
      setDisliked(data.disliked);
      setDislikes(data.dislikes);
      setLiked(data.liked);
      setLikes(data.likes);
  
    } catch (err) {
      console.error('Error al cambiar dislike:', err);
      // Mostrar notificación al usuario
    }
  };
  const sortedTags = [...post.tags].sort((a, b) => {
    if (a === 'ventanilla para mujeres') return -1;
    if (b === 'ventanilla para mujeres') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <Link 
        href={`/perfil/${post.user_id}`} 
        onClick={(e) => {
          e.preventDefault(); // Previene la navegación por defecto
          router.push(`/perfil/${post.user_id}`); // Navegación controlada
        }}
        className="flex items-center gap-3 mb-3 group hover:bg-slate-700/30 p-2 rounded-lg transition-colors"
      >
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

      <Link href={`/foro/${post.id}`} className="block">
        <p className="whitespace-pre-line mb-4 hover:bg-slate-700/10 rounded-lg p-2 transition-colors">
          {post.content.slice(0, 300)}
          {post.content.length > 300 && '…'}
        </p>
        
        {post.image && (
          <div className="my-4">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE || ''}/uploads${post.image}`}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg object-cover max-h-64 w-full hover:brightness-110 transition-all"
              unoptimized  // Añadir para imágenes locales
            />
          </div>
        )}
      </Link>

      {post.tags.length ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedTags.map(t => (
            <span 
              key={t} 
              className={`px-3 py-1 text-xs rounded-full ${
                t === 'ventanilla para mujeres'
                  ? 'bg-purple-500/10 text-purple-300'  // Estilo especial
                  : 'bg-cyan-400/10 text-cyan-300'      // Estilo normal
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

        <Link 
          href={`/foro/${post.id}`} 
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-300"
        >
          <FiMessageCircle size={18} />
          {post.comments}
        </Link>
      </div>
    </div>
  );
}