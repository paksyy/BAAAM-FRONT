import React from 'react';
import { StatCard } from '../ui/StatCard';
import { FiAnchor, FiDollarSign, FiUsers, FiActivity } from 'react-icons/fi';

interface StatsSectionProps {
  statsRapidas: {
    produccion: string;
    valor: string;
    pescadores: string;
    especies: string;
  };
}

export const StatsSection: React.FC<StatsSectionProps> = ({ statsRapidas }) => (
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard
      title="Producción Total"
      value={statsRapidas.produccion}
      icon={FiAnchor}
      colorFrom="from-blue-500"
      colorTo="to-cyan-500"
    />
    <StatCard
      title="Valor Económico"
      value={statsRapidas.valor}
      icon={FiDollarSign}
      colorFrom="from-green-500"
      colorTo="to-emerald-500"
    />
    <StatCard
      title="Pescadores"
      value={statsRapidas.pescadores}
      subtitle="Registrados"
      icon={FiUsers}
      colorFrom="from-purple-500"
      colorTo="to-pink-500"
    />
    <StatCard
      title="Especies"
      value={statsRapidas.especies}
      subtitle="Monitoreadas"
      icon={FiActivity}
      colorFrom="from-orange-500"
      colorTo="to-red-500"
    />
  </section>
);