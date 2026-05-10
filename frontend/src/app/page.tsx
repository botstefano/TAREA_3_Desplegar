'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/utils/trpc';
import { Card } from '@/components/Card';
import { Briefcase, GraduationCap, Building2, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const practicasMetrics = api.practicas.metrics.useQuery();
  const tesisMetrics = api.tesis.metrics.useQuery();
  const globalStats = api.reportes.globalStats.useQuery();

  const pmLoading = practicasMetrics.isLoading || tesisMetrics.isLoading || globalStats.isLoading;

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-unt-blue">Dashboard UNT</h1>
          <p className="text-gray-600">Gestión de Prácticas Preprofesionales y Tesis</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={20} />
          <span className="text-sm font-medium">Datos en vivo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Prácticas en curso"
          value={pmLoading ? '...' : practicasMetrics.data?.en_progreso ?? 0}
          icon={<Briefcase size={20} />}
          description={`Total prácticas: ${practicasMetrics.data?.total ?? 0}`}
        />
        <Card
          title="Tesis registradas"
          value={pmLoading ? '...' : tesisMetrics.data?.total ?? 0}
          icon={<GraduationCap size={20} />}
          description={`En desarrollo: ${tesisMetrics.data?.en_desarrollo ?? 0}`}
        />
        <Card
          title="Empresas con convenio"
          value={pmLoading ? '...' : globalStats.data?.empresas_con_convenio ?? 0}
          icon={<Building2 size={20} />}
          description={`Ofertas activas: ${globalStats.data?.total_ofertas_activas ?? 0}`}
        />
      </div>

      <div className="mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/practicas"
            className="bg-unt-blue text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition shadow-sm font-medium"
          >
            Gestionar prácticas y ofertas
          </Link>
          <Link
            href="/tesis"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium"
          >
            Gestionar tesis
          </Link>
          <Link
            href="/reportes"
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Ver reportes
          </Link>
        </div>
      </div>
    </div>
  );
}
