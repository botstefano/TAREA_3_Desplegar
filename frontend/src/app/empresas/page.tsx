'use client';

import React, { useState } from 'react';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    ruc: '',
    razon_social: '',
    direccion: '',
    correo_contacto: '',
  });

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empresas/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruc: form.ruc.trim(),
          razon_social: form.razon_social.trim(),
          direccion: form.direccion.trim() || null,
          correo_contacto: form.correo_contacto.trim() || null,
          tiene_convenio: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear empresa');
      }

      setForm({ ruc: '', razon_social: '', direccion: '', correo_contacto: '' });
      // Recargar lista
      loadEmpresas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsCreating(false);
    }
  };

  const loadEmpresas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empresas/list`);
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (err) {
      console.error('Error cargando empresas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadEmpresas();
  }, []);

  return (
    <div className="p-8 space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <p className="mt-2 text-gray-600">Gestión de aliados y convenios (alta y listado).</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Registrar empresa</h2>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="RUC (11 dígitos)"
            value={form.ruc}
            onChange={(e) => setForm((s) => ({ ...s, ruc: e.target.value }))}
            required
            maxLength={11}
          />
          <input
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="Razón social"
            value={form.razon_social}
            onChange={(e) => setForm((s) => ({ ...s, razon_social: e.target.value }))}
            required
          />
          <input
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="Dirección (opcional)"
            value={form.direccion}
            onChange={(e) => setForm((s) => ({ ...s, direccion: e.target.value }))}
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Correo de contacto (opcional)"
            value={form.correo_contacto}
            onChange={(e) => setForm((s) => ({ ...s, correo_contacto: e.target.value }))}
          />
          <button
            type="submit"
            disabled={isCreating}
            className="bg-unt-blue text-white px-4 py-2 rounded-lg hover:bg-blue-900 disabled:opacity-50 w-fit md:col-span-3"
          >
            {isCreating ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Listado</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-4">Razón social</th>
                <th className="py-2 pr-4">RUC</th>
                <th className="py-2 pr-4">Convenio</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(
                (e: { id: string; razon_social: string; ruc: string; tiene_convenio: boolean | null }) => (
                  <tr key={e.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4">{e.razon_social}</td>
                    <td className="py-2 pr-4">{e.ruc}</td>
                    <td className="py-2 pr-4">{e.tiene_convenio ? 'Sí' : 'No'}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {isLoading && <p className="text-gray-500 text-sm mt-2">Cargando…</p>}
        </div>
      </section>
    </div>
  );
}