import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorFrom: string;
  colorTo: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  colorFrom, 
  colorTo, 
  subtitle 
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`bg-gradient-to-r ${colorFrom} ${colorTo} p-6 rounded-xl shadow-lg`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
      </div>
      <Icon size={32} className="opacity-80" />
    </div>
  </motion.div>
);