'use client';

import React from 'react';

export default function SettingsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/trpc';

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-gray-600">Panel de estado y parámetros del entorno.</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Conectividad</h2>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <p className="text-gray-500">API (tRPC)</p>
            <p className="font-mono break-all">{apiUrl}</p>
          </div>
          <div className="text-gray-500">
            Si la UI carga pero no trae datos, revisa que Docker esté arriba y que el puerto 4000 esté
            accesible.
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Acciones rápidas</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>
            Para reinicializar datos demo (solo si necesitas): <span className="font-mono">docker compose down -v</span>{' '}
            y luego <span className="font-mono">docker compose up --build -d</span>.
          </li>
          <li>
            Frontend: <span className="font-mono">http://localhost:3000</span>
          </li>
          <li>
            Backend: <span className="font-mono">http://localhost:4000/trpc/getHello</span>
          </li>
        </ul>
      </section>
    </div>
  );
}