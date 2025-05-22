'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle } from 'react-icons/fi';
import { resolveAvatar } from '@/utils/resolveAvatar';

export interface CommentModel {
  id: number;
  author: string;
  profile_image?: string | null;
  content: string;
  position?: string;
  created_at: string;
  likes: number;
  dislikes: number;
  liked_by_user?: boolean;
  disliked_by_user?: boolean;
  user_id: number;
}

export default function Comment({ comment }: { comment: CommentModel }) {
  const [liked, setLiked] = useState(!!comment.liked_by_user);
  const [disliked, setDisliked] = useState(!!comment.disliked_by_user);
  const [likesCount, setLikes] = useState(comment.likes);
  const [dislikesCount, setDislikes] = useState(comment.dislikes);
  const [busy, setBusy] = useState(false);

  const toggleReaction = async (type: 'like' | 'dislike') => {
    if (busy) return;
    setBusy(true);
    
    try {
      const method = (type === 'like' && !liked) || (type === 'dislike' && !disliked) 
        ? 'POST' 
        : 'DELETE';
      
      const endpoint = type === 'like' 
        ? `comment/${comment.id}/like`
        : `comment/${comment.id}/dislike`;
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/${endpoint}`,
        { method, credentials: 'include' }
      );
      
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked || false);
        setDisliked(data.disliked || false);
        setLikes(data.likes);
        setDislikes(data.dislikes);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600/70 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Image
          src={resolveAvatar(comment.profile_image || '/default-avatar.png')}
          alt={comment.author}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = '/default-avatar.png';
          }}
        />
        
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-cyan-300">{comment.author}</span>
              {comment.position && (
                <span className="text-xs text-slate-400">{comment.position}</span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          
          {/* Contenido */}
          <p className="mt-2 text-slate-100 whitespace-pre-line">
            {comment.content}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4 ml-13 text-sm">
        <button
          onClick={() => toggleReaction('like')}
          disabled={busy}
          className={`flex items-center gap-1 ${
            liked ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <FiThumbsUp className={liked ? 'fill-cyan-400' : ''} />
          {likesCount}
        </button>
        
        <button
          onClick={() => toggleReaction('dislike')}
          disabled={busy}
          className={`flex items-center gap-1 ${
            disliked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <FiThumbsDown className={disliked ? 'fill-rose-400' : ''} />
          {dislikesCount}
        </button>
        
        <button className="text-slate-400 hover:text-cyan-300">
          <FiMessageCircle />
        </button>
      </div>
    </div>
  );
}