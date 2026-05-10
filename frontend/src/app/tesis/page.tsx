'use client';

import React, { useMemo, useState } from 'react';
import { api } from '@/utils/trpc';

const ESTADOS_TESIS = [
  'proyecto_registrado',
  'en_desarrollo',
  'sustentacion_programada',
  'aprobada',
  'observada',
] as const;

export default function TesisPage() {
  const utils = api.useContext();

  const list = api.tesis.list.useQuery();
  const estudiantes = api.practicas.listEstudiantes.useQuery();
  const asesores = api.tesis.listAsesores.useQuery();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const avances = api.tesis.avancesByTesis.useQuery(
    { tesis_id: selectedId ?? '' },
    { enabled: !!selectedId },
  );
  const jurados = api.tesis.juradosByTesis.useQuery(
    { tesis_id: selectedId ?? '' },
    { enabled: !!selectedId },
  );

  const create = api.tesis.create.useMutation({
    onSuccess: () => void utils.tesis.list.invalidate(),
  });
  const updateEstado = api.tesis.updateEstado.useMutation({
    onSuccess: () => void utils.tesis.list.invalidate(),
  });
  const deleteTesis = api.tesis.delete.useMutation({
    onSuccess: () => {
      void utils.tesis.list.invalidate();
      setSelectedId(null);
    },
  });
  const createAvance = api.tesis.createAvance.useMutation({
    onSuccess: () => void utils.tesis.avancesByTesis.invalidate(),
  });
  const deleteAvance = api.tesis.deleteAvance.useMutation({
    onSuccess: () => void utils.tesis.avancesByTesis.invalidate(),
  });
  const addJurado = api.tesis.addJurado.useMutation({
    onSuccess: () => void utils.tesis.juradosByTesis.invalidate(),
  });
  const removeJurado = api.tesis.removeJurado.useMutation({
    onSuccess: () => void utils.tesis.juradosByTesis.invalidate(),
  });

  const [form, setForm] = useState({
    titulo: '',
    estudiante_id: '',
    asesor_id: '',
  });
  const [avanceForm, setAvanceForm] = useState({ titulo: '', descripcion: '' });
  const [juradoUserId, setJuradoUserId] = useState('');

  const selected = useMemo(
    () => (list.data ?? []).find((t: { id: string }) => t.id === selectedId),
    [list.data, selectedId],
  );

  const errMsg = (e: unknown) =>
    e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Error';

  return (
    <div className="p-8 space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tesis</h1>
        <p className="mt-2 text-gray-600">
          Registro de proyectos, cambios de estado, avances y jurados.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Nueva tesis</h2>
        {(estudiantes.isError || asesores.isError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">No se pudieron cargar los datos del formulario.</p>
            <p className="mt-1 text-red-700">
              Comprueba que el backend esté en marcha ({' '}
              <code className="rounded bg-red-100 px-1">http://localhost:4000</code>
              ) y recarga la página.
            </p>
            {estudiantes.isError && (
              <p className="mt-2 text-xs">Estudiantes: {errMsg(estudiantes.error)}</p>
            )}
            {asesores.isError && (
              <p className="mt-2 text-xs">Asesores: {errMsg(asesores.error)}</p>
            )}
          </div>
        )}
        {!estudiantes.isLoading &&
          !estudiantes.isError &&
          (estudiantes.data?.length ?? 0) === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No hay estudiantes en la base de datos. Si acabas de crear el volumen de Postgres, ejecuta el seed (
              <code className="rounded bg-amber-100 px-1">database/seed.sql</code>) o recrea el volumen con{' '}
              <code className="rounded bg-amber-100 px-1">docker compose down -v</code> y vuelve a levantar los
              servicios.
            </div>
          )}
        {!asesores.isLoading &&
          !asesores.isError &&
          (asesores.data?.length ?? 0) === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No hay usuarios con rol &quot;asesor&quot; para elegir. Añade uno en la tabla{' '}
              <code className="rounded bg-amber-100 px-1">usuarios</code> o revisa que el seed se haya aplicado.
            </div>
          )}
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            create.mutate(
              {
                titulo: form.titulo.trim(),
                estudiante_id: form.estudiante_id,
                asesor_id: form.asesor_id || null,
              },
              { onSuccess: () => setForm({ titulo: '', estudiante_id: '', asesor_id: '' }) },
            );
          }}
        >
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2 text-gray-900 bg-white"
            placeholder="Título del proyecto"
            value={form.titulo}
            onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))}
            required
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2 text-gray-900 bg-white"
            value={form.estudiante_id}
            onChange={(e) => setForm((s) => ({ ...s, estudiante_id: e.target.value }))}
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
            className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2 text-gray-900 bg-white"
            value={form.asesor_id}
            onChange={(e) => setForm((s) => ({ ...s, asesor_id: e.target.value }))}
          >
            <option value="">Asesor (opcional)…</option>
            {(asesores.data ?? []).map((a: { id: string; nombre: string; apellidos: string }) => (
              <option key={a.id} value={a.id}>
                {a.apellidos}, {a.nombre}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={create.isLoading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Registrar tesis
          </button>
        </form>
        {create.isError && <p className="text-sm text-red-600">{errMsg(create.error)}</p>}
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Listado</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-4">Título</th>
                <th className="py-2 pr-4">Estudiante</th>
                <th className="py-2 pr-4">Asesor</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map(
                (t: {
                  id: string;
                  titulo: string;
                  estudiante_nombre: string | null;
                  asesor_nombre: string | null;
                  estado: string;
                }) => (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4 max-w-xs truncate">{t.titulo}</td>
                    <td className="py-2 pr-4">{t.estudiante_nombre ?? '—'}</td>
                    <td className="py-2 pr-4">{t.asesor_nombre ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-xs max-w-[160px] text-gray-900 bg-white"
                        value={t.estado}
                        onChange={(e) =>
                          updateEstado.mutate({
                            id: t.id,
                            estado: e.target.value as (typeof ESTADOS_TESIS)[number],
                          })
                        }
                      >
                        {ESTADOS_TESIS.map((es) => (
                          <option key={es} value={es}>
                            {es}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        className={`text-xs px-2 py-1 rounded ${
                          selectedId === t.id ? 'bg-blue-100 text-blue-900' : 'text-blue-600 hover:underline'
                        }`}
                        onClick={() => setSelectedId(t.id)}
                      >
                        Abrir
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline ml-2"
                        onClick={() => {
                          if (confirm('¿Eliminar esta tesis?')) deleteTesis.mutate({ id: t.id });
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
          {list.isLoading && <p className="text-gray-500 text-sm mt-2">Cargando…</p>}
        </div>
      </section>

      {selected && selectedId && (
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">{selected.titulo}</h3>
              <p className="text-sm text-gray-500">
                Estado actual: <span className="font-medium">{selected.estado}</span>
              </p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Avances</h4>
            <form
              className="flex flex-wrap gap-2 items-end"
              onSubmit={(ev) => {
                ev.preventDefault();
                createAvance.mutate(
                  {
                    tesis_id: selectedId,
                    titulo: avanceForm.titulo.trim(),
                    descripcion: avanceForm.descripcion.trim() || null,
                  },
                  { onSuccess: () => setAvanceForm({ titulo: '', descripcion: '' }) },
                );
              }}
            >
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] text-gray-900 bg-white"
                placeholder="Título del avance"
                value={avanceForm.titulo}
                onChange={(e) => setAvanceForm((s) => ({ ...s, titulo: e.target.value }))}
                required
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] text-gray-900 bg-white"
                placeholder="Descripción"
                value={avanceForm.descripcion}
                onChange={(e) => setAvanceForm((s) => ({ ...s, descripcion: e.target.value }))}
              />
              <button
                type="submit"
                disabled={createAvance.isLoading}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
              >
                Añadir avance
              </button>
            </form>
            <ul className="space-y-2 text-sm">
              {(avances.data ?? []).map(
                (a: { id: string; titulo: string; fecha_entrega: string | null; aprobado: boolean }) => (
                  <li key={a.id} className="flex justify-between border rounded-lg px-3 py-2">
                    <span>
                      <span className="font-medium">{a.titulo}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {a.fecha_entrega ? new Date(a.fecha_entrega).toLocaleString() : ''}
                      </span>
                      {a.aprobado ? (
                        <span className="text-emerald-600 text-xs ml-2">Aprobado</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      className="text-red-600 text-xs"
                      onClick={() => {
                        if (confirm('¿Eliminar avance?')) deleteAvance.mutate({ id: a.id });
                      }}
                    >
                      Quitar
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Jurado</h4>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
                value={juradoUserId}
                onChange={(e) => setJuradoUserId(e.target.value)}
              >
                <option value="">Docente jurado…</option>
                {(asesores.data ?? []).map((a: { id: string; nombre: string; apellidos: string }) => (
                  <option key={a.id} value={a.id}>
                    {a.apellidos}, {a.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!juradoUserId || addJurado.isLoading}
                className="bg-unt-blue text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                onClick={() => {
                  if (!juradoUserId) return;
                  addJurado.mutate({ tesis_id: selectedId, usuario_id: juradoUserId });
                  setJuradoUserId('');
                }}
              >
                Asignar
              </button>
            </div>
            <ul className="text-sm space-y-1">
              {(jurados.data ?? []).map((j: { usuario_id: string; jurado_nombre: string }) => (
                <li key={j.usuario_id} className="flex justify-between border rounded px-3 py-2">
                  <span>{j.jurado_nombre}</span>
                  <button
                    type="button"
                    className="text-red-600 text-xs"
                    onClick={() =>
                      removeJurado.mutate({ tesis_id: selectedId, usuario_id: j.usuario_id })
                    }
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
