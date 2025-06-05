import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
  downloadable?: boolean;
}

const downloadChart = async (domId: string, filename: string) => {
  const el = document.getElementById(domId);
  if (!el) return console.warn('downloadChart: no element id', domId);
  const canvas = await html2canvas(el as HTMLElement, {
    backgroundColor: '#00000000',
    scale: window.devicePixelRatio,
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
};

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  title, 
  description, 
  children, 
  id, 
  downloadable = true 
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/60 rounded-xl p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-cyan-100/70 mt-1">{description}</p>
        )}
      </div>
      {downloadable && id && (
        <button
          onClick={() => downloadChart(id, `${id}.png`)}
          title="Descargar PNG"
          className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
        >
          <FiDownload size={18} />
        </button>
      )}
    </div>
    <div
      id={id}
      className={`relative w-full ${id === 'mapUnid' ? 'h-[500px]' : 'h-80'}`}
    >
      {children}
    </div>
  </motion.div>
);