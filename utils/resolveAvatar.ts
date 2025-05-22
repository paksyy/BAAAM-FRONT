export function resolveAvatar(src?: string) {
    if (!src) return '/default-avatar.png';
  
    // si ya viene con http/https la dejamos tal cual
    if (/^https?:\/\//i.test(src)) return src;
  
    // concatenamos con la base del API (env)
    const base = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || '';
    return `${base}${src}`;
  }
  