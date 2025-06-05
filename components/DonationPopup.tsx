'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const DonationPopup: React.FC = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative bg-white border-2 border-blue-500 text-slate-900 mx-auto max-w-7xl mt-4 p-6 rounded-lg shadow-lg">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-blue-500 hover:text-blue-700"
        aria-label="Cerrar"
      >
        <FiX size={20} />
      </button>
      <h2 className="text-2xl font-bold mb-2">¿Por qué donar a BAA’AM?</h2>
      <p className="text-base mb-4 leading-relaxed">
        Tu donativo en BAA’AM fortalece el sector acuícola y pesquero mexicano mediante
        tecnología, información actualizada e inteligencia artificial. Como Patrocinador,
        accedes a estadísticas, foros, informes completos, promoción de productos y difusión
        de eventos. Conectamos actores clave para impulsar el desarrollo sostenible y
        oportunidades en un ecosistema digital innovador.
      </p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Dona
      </button>
    </div>
  );
};

export default DonationPopup;
