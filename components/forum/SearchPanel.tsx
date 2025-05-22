'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface Props { onChange: (p:{q?:string; tag?:string}) => void }

export default function SearchPanel({ onChange }:Props) {
  const [text,setText] = useState('');
  const [tag ,setTag ] = useState<string>();
  const [busy,setBusy] = useState(false);
  const [all ,setAll ] = useState<string[]>([]);

  /* cargar etiquetas */
  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/forum/tags`,{credentials:'include'})
      .then(r=>r.ok?r.json():[])
      .then(setAll).catch(()=>{});
  },[]);

  const apply = ()=>{
    setBusy(true);
    onChange({ q:text||undefined, tag });
    setTimeout(()=>setBusy(false),500);
  };
  const clear=()=>{
    setText(''); setTag(undefined);
    onChange({}); setBusy(true);
    setTimeout(()=>setBusy(false),500);
  };

  return(
    <div className="sticky top-24 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 w-full lg:w-72 space-y-4">
      <h3 className="text-lg font-medium text-cyan-300">Buscar</h3>

      {/* texto */}
      <div>
        <label className="block text-cyan-300 text-sm mb-1">Texto o usuario</label>
        <div className="relative flex items-center bg-slate-700/70 rounded focus-within:ring-1 focus-within:ring-cyan-500">
          <FiSearch className="ml-2 text-cyan-400"/>
          <input
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&apply()}
            placeholder="Buscar contenido..."
            className="flex-1 bg-transparent px-2 py-1 focus:outline-none text-sm text-white"
          />
          {text&&(
            <button onClick={()=>setText('')} className="absolute right-2 text-cyan-400 hover:text-white">
              <FiX/>
            </button>
          )}
        </div>
      </div>

      {/* etiqueta */}
      <div>
        <label className="block text-cyan-300 text-sm mb-1">Etiqueta</label>
        <select
          value={tag??''}
          onChange={e=>setTag(e.target.value||undefined)}
          className="w-full bg-slate-700/70 p-2 rounded focus:outline-none text-sm text-white"
        >
          <option value="">Todas</option>
          {all.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>

      {/* acciones */}
      <div className="flex justify-between">
        <button
          onClick={apply}
          disabled={busy}
          className={`flex-1 mr-2 py-2 rounded-lg text-sm font-medium ${
            busy?'bg-slate-600 text-slate-400':'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
          }`}
        >
          {busy?'Buscando…':'Aplicar'}
        </button>
        <button onClick={clear} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-400">
          <FiX/>
        </button>
      </div>
    </div>
  );
}
