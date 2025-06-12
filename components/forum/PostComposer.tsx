'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { FiPlus, FiSend, FiX, FiImage } from 'react-icons/fi';
import { TAGS } from '@/constants/tags';

const MAX_CORE_TAGS = 5;
const MAX_CHARS = 3000;
const VENTANILLA = 'ventanilla para mujeres';

export default function PostComposer({ onPublish }: { onPublish: () => void }) {
  /* ─────────── State ─────────── */
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  /* ─────────── Refs / Effects ─────────── */
  const ref = useRef<HTMLDivElement>(null);

  /* Cerrar dropdown al hacer clic fuera */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  /* Generar preview de la imagen */
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(image);
  }, [image]);

  /* ─────────── Tags helpers ─────────── */
  const coreCount = useMemo(
    () => tags.filter(t => t !== VENTANILLA).length,
    [tags]
  );

  const options = useMemo(() => {
    return TAGS
      .filter(t => !tags.includes(t))
      .filter(t => t.toLowerCase().includes(search.toLowerCase()))
      .filter(t => coreCount < MAX_CORE_TAGS || t === VENTANILLA);
  }, [search, tags, coreCount]);

  const addTag = (t: string) =>
    setTags(a => {
      const alreadyCore = a.filter(x => x !== VENTANILLA).length;
      const canAddCore = alreadyCore < MAX_CORE_TAGS;
      if (t === VENTANILLA || canAddCore) return [...a, t].sort();
      return a;
    });

  const removeTag = (t: string) => setTags(a => a.filter(x => x !== t));

  /* ─────────── Publicar ─────────── */
  const publish = async () => {
    if (!text.trim()) return;
    setBusy(true);

    const formData = new FormData();
    formData.append('content', text);
    formData.append('tags', JSON.stringify(tags));
    if (image) formData.append('image', image);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/forum/posts`,
        { method: 'POST', credentials: 'include', body: formData }
      );
      if (res.ok) {
        setText('');
        setTags([]);
        setImage(null);
        setImagePreview(null);
        setSearch('');
        setOpen(false);
        onPublish();
      }
    } catch (err) {
      console.error('Error al publicar:', err);
    } finally {
      setBusy(false);
    }
  };

  /* ─────────── Render ─────────── */
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 relative">
      {/* ▸ Textarea con contador */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
        maxLength={MAX_CHARS}
        rows={3}
        placeholder="¿Qué quieres preguntar o compartir?"
        className="w-full bg-transparent p-3 rounded-lg border border-slate-700 focus:outline-none resize-y"
      />
      <span className="absolute bottom-[1.2rem] left-[1.4rem] text-sm text-slate-400">
        {MAX_CHARS - text.length} caracteres restantes
      </span>

      {/* ▸ Preview de imagen */}
      {imagePreview && (
        <div className="relative my-4">
          <img
            src={imagePreview}
            alt="Previsualización"
            className="rounded-lg object-cover max-h-64 w-full"
          />
          <button
            onClick={() => {
              setImage(null);
              setImagePreview(null);
            }}
            className="absolute top-2 right-2 bg-slate-800/80 p-1 rounded-full hover:bg-slate-700"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* ▸ Chips de tags + botones */}
      <div className="flex flex-wrap gap-2 my-4">
        {tags.map(t => (
          <span
            key={t}
            className="flex items-center px-3 py-1 bg-cyan-500 text-slate-900 rounded-full text-xs"
          >
            {t}
            <button onClick={() => removeTag(t)} className="ml-1">
              <FiX size={12} />
            </button>
          </span>
        ))}

        {/* Añadir etiqueta */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 px-3 py-1 border border-cyan-500 text-cyan-500 rounded-full text-xs"
        >
          <FiPlus size={14} /> Etiqueta
        </button>

        {/* Añadir imagen */}
        <label className="flex items-center gap-1 px-3 py-1 border border-cyan-500 text-cyan-500 rounded-full text-xs cursor-pointer">
          <FiImage size={14} /> Imagen
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      {/* ▸ Dropdown de búsqueda de tag */}
      {open && (
        <div ref={ref} className="relative mb-4">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar etiqueta…"
            className="w-full bg-slate-700/70 p-2 rounded border border-cyan-500 focus:outline-none"
          />
          <ul className="absolute z-10 w-full max-h-60 overflow-auto bg-slate-800 border border-slate-700 rounded-b-lg">
            {options.length ? (
              options.map(t => {
                const disabled =
                  coreCount >= MAX_CORE_TAGS && t !== VENTANILLA;
                return (
                  <li
                    key={t}
                    onClick={() => !disabled && addTag(t)}
                    className={`px-3 py-2 text-sm ${
                      disabled
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'hover:bg-cyan-500/20 cursor-pointer'
                    }`}
                  >
                    {t}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-cyan-300/70">
                Sin coincidencias
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ▸ Contador de tags core (opcional visual) */}
      <p className="text-xs text-right text-slate-400 mb-2">
        {coreCount}/{MAX_CORE_TAGS} categorías seleccionadas
      </p>

      {/* ▸ Botón publicar */}
      <div className="flex justify-end">
        <button
          onClick={publish}
          disabled={busy || !text.trim()}
          className="flex items-center px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 disabled:opacity-50"
        >
          <FiSend className="mr-2" />
          {busy ? 'Enviando…' : 'Publicar'}
        </button>
      </div>
    </div>
  );
}
