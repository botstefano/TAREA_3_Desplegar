'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Briefcase, GraduationCap, Building2, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [practicasMetrics, setPracticasMetrics] = useState<any>(null);
  const [tesisMetrics, setTesisMetrics] = useState<any>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Cargar métricas de prácticas
        const practicasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/practicas/metrics`);
        if (practicasResponse.ok) {
          const practicasData = await practicasResponse.json();
          setPracticasMetrics(practicasData);
        }

        // Cargar métricas de tesis
        const tesisResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tesis/metrics`);
        if (tesisResponse.ok) {
          const tesisData = await tesisResponse.json();
          setTesisMetrics(tesisData);
        }

        // Cargar estadísticas globales
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/globalStats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setGlobalStats(statsData);
        }
      } catch (error) {
        console.error('Error cargando métricas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

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
          value={isLoading ? '...' : practicasMetrics?.en_progreso ?? 0}
          icon={<Briefcase size={20} />}
          description={`Total prácticas: ${practicasMetrics?.total ?? 0}`}
        />
        <Card
          title="Tesis registradas"
          value={isLoading ? '...' : tesisMetrics?.total ?? 0}
          icon={<GraduationCap size={20} />}
          description={`En desarrollo: ${tesisMetrics?.en_desarrollo ?? 0}`}
        />
        <Card
          title="Empresas con convenio"
          value={isLoading ? '...' : globalStats?.empresas_con_convenio ?? 0}
          icon={<Building2 size={20} />}
          description={`Ofertas activas: ${globalStats?.total_ofertas_activas ?? 0}`}
        />
      </div>

      <div className="mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/empresas"
            className="bg-unt-blue text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition shadow-sm font-medium"
          >
            Gestionar empresas
          </Link>
          <Link
            href="/practicas"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium"
          >
            Gestionar prácticas
          </Link>
          <Link
            href="/tesis"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-sm font-medium"
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
