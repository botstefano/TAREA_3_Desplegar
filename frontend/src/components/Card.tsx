import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const Card: React.FC<CardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-xs font-bold ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
  );
};
