'use client';

import React, { useState } from 'react';
import { api } from '@/utils/trpc';

const ESTADOS_PRACTICA = [
  'pendiente',
  'aprobada',
  'en_progreso',
  'finalizada',
  'rechazada',
] as const;

export default function PracticasPage() {
  const utils = api.useUtils();

  const empresas = api.practicasModule.listEmpresas.useQuery();
  const estudiantes = api.practicasModule.listEstudiantes.useQuery();
  const ofertas = api.practicasModule.listOfertas.useQuery();
  const practicas = api.practicasModule.list.useQuery();

  const createEmpresa = api.practicas.createEmpresa.useMutation({
    onSuccess: () => {
      void utils.practicas.listEmpresas.invalidate();
    },
  });
  const createOferta = api.practicas.createOferta.useMutation({
    onSuccess: () => {
      void utils.practicas.listOfertas.invalidate();
    },
  });
  const deleteOferta = api.practicas.deleteOferta.useMutation({
    onSuccess: () => {
      void utils.practicas.listOfertas.invalidate();
    },
  });
  const createPractica = api.practicas.create.useMutation({
    onSuccess: () => {
      void utils.practicas.list.invalidate();
      void utils.practicas.metrics.invalidate();
    },
  });
  const updateEstado = api.practicas.updateEstado.useMutation({
    onSuccess: () => {
      void utils.practicas.list.invalidate();
      void utils.practicas.metrics.invalidate();
    },
  });
  const deletePractica = api.practicas.delete.useMutation({
    onSuccess: () => {
      void utils.practicas.list.invalidate();
      void utils.practicas.metrics.invalidate();
    },
  });

  const [empresaForm, setEmpresaForm] = useState({
    ruc: '',
    razon_social: '',
    direccion: '',
  });
  const [ofertaForm, setOfertaForm] = useState({
    empresa_id: '',
    titulo: '',
    descripcion: '',
    vacantes: '1',
  });
  const [practicaForm, setPracticaForm] = useState({
    estudiante_id: '',
    oferta_id: '',
    asesor_id: '',
  });

  const errMsg = (e: unknown) =>
    e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Error';

  return (
    <div className="p-8 space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prácticas preprofesionales</h1>
        <p className="mt-2 text-gray-600">
          Gestión de empresas, ofertas y prácticas alineada al modelo de base de datos.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Nueva empresa</h2>
        <form
          className="grid gap-4 md:grid-cols-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            createEmpresa.mutate(
              {
                ruc: empresaForm.ruc.trim(),
                razon_social: empresaForm.razon_social.trim(),
                direccion: empresaForm.direccion.trim() || null,
                tiene_convenio: true,
              },
              {
                onSuccess: () =>
                  setEmpresaForm({ ruc: '', razon_social: '', direccion: '' }),
              },
            );
          }}
        >
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="RUC (11 dígitos)"
            value={empresaForm.ruc}
            onChange={(e) => setEmpresaForm((s) => ({ ...s, ruc: e.target.value }))}
            required
            maxLength={11}
          />
          <input
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="Razón social"
            value={empresaForm.razon_social}
            onChange={(e) => setEmpresaForm((s) => ({ ...s, razon_social: e.target.value }))}
            required
          />
          <input
            className="border rounded-lg px-3 py-2 md:col-span-3"
            placeholder="Dirección (opcional)"
            value={empresaForm.direccion}
            onChange={(e) => setEmpresaForm((s) => ({ ...s, direccion: e.target.value }))}
          />
          <button
            type="submit"
            disabled={createEmpresa.isLoading}
            className="bg-unt-blue text-white px-4 py-2 rounded-lg hover:bg-blue-900 disabled:opacity-50 md:col-span-3 w-fit"
          >
            Registrar empresa
          </button>
        </form>
        {createEmpresa.isError && (
          <p className="text-sm text-red-600">{errMsg(createEmpresa.error)}</p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Nueva oferta</h2>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!ofertaForm.empresa_id) return;
            createOferta.mutate(
              {
                empresa_id: ofertaForm.empresa_id,
                titulo: ofertaForm.titulo.trim(),
                descripcion: ofertaForm.descripcion.trim(),
                vacantes: parseInt(ofertaForm.vacantes, 10) || 1,
              },
              {
                onSuccess: () =>
                  setOfertaForm({ empresa_id: ofertaForm.empresa_id, titulo: '', descripcion: '', vacantes: '1' }),
              },
            );
          }}
        >
          <select
            className="border rounded-lg px-3 py-2 md:col-span-2"
            value={ofertaForm.empresa_id}
            onChange={(e) => setOfertaForm((s) => ({ ...s, empresa_id: e.target.value }))}
            required
          >
            <option value="">Seleccionar empresa…</option>
            {(empresas.data ?? []).map((e: { id: string; razon_social: string }) => (
              <option key={e.id} value={e.id}>
                {e.razon_social}
              </option>
            ))}
          </select>
          <input
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="Título de la oferta"
            value={ofertaForm.titulo}
            onChange={(e) => setOfertaForm((s) => ({ ...s, titulo: e.target.value }))}
            required
          />
          <textarea
            className="border rounded-lg px-3 py-2 md:col-span-2 min-h-[96px]"
            placeholder="Descripción"
            value={ofertaForm.descripcion}
            onChange={(e) => setOfertaForm((s) => ({ ...s, descripcion: e.target.value }))}
            required
          />
          <input
            type="number"
            min={1}
            className="border rounded-lg px-3 py-2"
            placeholder="Vacantes"
            value={ofertaForm.vacantes}
            onChange={(e) => setOfertaForm((s) => ({ ...s, vacantes: e.target.value }))}
          />
          <button
            type="submit"
            disabled={createOferta.isLoading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Publicar oferta
          </button>
        </form>
        {createOferta.isError && (
          <p className="text-sm text-red-600">{errMsg(createOferta.error)}</p>
        )}

        <div className="overflow-x-auto pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ofertas publicadas</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-4">Título</th>
                <th className="py-2 pr-4">Empresa</th>
                <th className="py-2 pr-4">Vacantes</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(ofertas.data ?? []).map(
                (o: {
                  id: string;
                  titulo: string;
                  empresa_nombre: string | null;
                  vacantes: number | null;
                }) => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4">{o.titulo}</td>
                    <td className="py-2 pr-4">{o.empresa_nombre ?? '—'}</td>
                    <td className="py-2 pr-4">{o.vacantes ?? '—'}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => {
                          if (confirm('¿Eliminar esta oferta?')) deleteOferta.mutate({ id: o.id });
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {ofertas.isLoading && <p className="text-gray-500 text-sm mt-2">Cargando…</p>}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Registrar práctica</h2>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            createPractica.mutate(
              {
                estudiante_id: practicaForm.estudiante_id,
                oferta_id: practicaForm.oferta_id,
                asesor_id: practicaForm.asesor_id.trim() || null,
              },
              {
                onSuccess: () =>
                  setPracticaForm({ estudiante_id: '', oferta_id: '', asesor_id: '' }),
              },
            );
          }}
        >
          <select
            className="border rounded-lg px-3 py-2 md:col-span-2"
            value={practicaForm.estudiante_id}
            onChange={(e) => setPracticaForm((s) => ({ ...s, estudiante_id: e.target.value }))}
            required
          >
            <option value="">Estudiante…</option>
            {(estudiantes.data ?? []).map(
              (st: { id: string; codigo_estudiante: string; nombre_completo: string }) => (
                <option key={st.id} value={st.id}>
                  {st.codigo_estudiante} — {st.nombre_completo}
                </option>
              ),
            )}
          </select>
          <select
            className="border rounded-lg px-3 py-2 md:col-span-2"
            value={practicaForm.oferta_id}
            onChange={(e) => setPracticaForm((s) => ({ ...s, oferta_id: e.target.value }))}
            required
          >
            <option value="">Oferta…</option>
            {(ofertas.data ?? []).map((o: { id: string; titulo: string }) => (
              <option key={o.id} value={o.id}>
                {o.titulo}
              </option>
            ))}
          </select>
          <input
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="UUID asesor (opcional)"
            value={practicaForm.asesor_id}
            onChange={(e) => setPracticaForm((s) => ({ ...s, asesor_id: e.target.value }))}
          />
          <button
            type="submit"
            disabled={createPractica.isLoading}
            className="bg-unt-blue text-white px-4 py-2 rounded-lg hover:bg-blue-900 disabled:opacity-50"
          >
            Crear práctica
          </button>
        </form>
        {createPractica.isError && (
          <p className="text-sm text-red-600">{errMsg(createPractica.error)}</p>
        )}

        <div className="overflow-x-auto pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Prácticas registradas</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-4">Estudiante</th>
                <th className="py-2 pr-4">Oferta / Empresa</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(practicas.data ?? []).map(
                (p: {
                  id: string;
                  estudiante_nombre: string | null;
                  oferta_titulo: string | null;
                  empresa_nombre: string | null;
                  estado: string;
                }) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4">{p.estudiante_nombre ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <div>{p.oferta_titulo ?? '—'}</div>
                      <div className="text-xs text-gray-500">{p.empresa_nombre ?? ''}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        value={p.estado}
                        onChange={(e) =>
                          updateEstado.mutate({
                            id: p.id,
                            estado: e.target.value as (typeof ESTADOS_PRACTICA)[number],
                          })
                        }
                      >
                        {ESTADOS_PRACTICA.map((es) => (
                          <option key={es} value={es}>
                            {es}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => {
                          if (confirm('¿Eliminar esta práctica?')) deletePractica.mutate({ id: p.id });
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {practicas.isLoading && <p className="text-gray-500 text-sm mt-2">Cargando…</p>}
        </div>
      </section>
    </div>
  );
}
