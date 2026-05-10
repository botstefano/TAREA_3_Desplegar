'use client';

import React, { useState } from 'react';
import { api } from '@/utils/trpc';

export default function EmpresasPage() {
  const utils = api.useUtils();
  const empresas = api.practicasModule.listEmpresas.useQuery();
  const createEmpresa = api.practicasModule.createEmpresa.useMutation({
    onSuccess: () => void utils.practicasModule.listEmpresas.invalidate(),
  });

  const [form, setForm] = useState({
    ruc: '',
    razon_social: '',
    direccion: '',
    correo_contacto: '',
  });

  const errMsg = (e: unknown) =>
    e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Error';

  return (
    <div className="p-8 space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <p className="mt-2 text-gray-600">Gestión de aliados y convenios (alta y listado).</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Registrar empresa</h2>
        <form
          className="grid gap-4 md:grid-cols-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            createEmpresa.mutate(
              {
                ruc: form.ruc.trim(),
                razon_social: form.razon_social.trim(),
                direccion: form.direccion.trim() || null,
                correo_contacto: form.correo_contacto.trim() || null,
                tiene_convenio: true,
              },
              { onSuccess: () => setForm({ ruc: '', razon_social: '', direccion: '', correo_contacto: '' }) },
            );
          }}
        >
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
            disabled={createEmpresa.isLoading}
            className="bg-unt-blue text-white px-4 py-2 rounded-lg hover:bg-blue-900 disabled:opacity-50 w-fit md:col-span-3"
          >
            Guardar
          </button>
        </form>
        {createEmpresa.isError && <p className="text-sm text-red-600">{errMsg(createEmpresa.error)}</p>}
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
              {(empresas.data ?? []).map(
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
          {empresas.isLoading && <p className="text-gray-500 text-sm mt-2">Cargando…</p>}
        </div>
      </section>
    </div>
  );
}