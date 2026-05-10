'use client';

import React, { useState } from 'react';
import { api } from '@/utils/trpc';
import { saveAs } from 'file-saver';

export default function ReportesPage() {
  const globalStats = api.reports.globalStats.useQuery();
  const estudiantes = api.practicas.listEstudiantes.useQuery();

  const [estudianteId, setEstudianteId] = useState('');
  const summary = api.reports.studentSummary.useQuery(
    { estudiante_id: estudianteId },
    { enabled: !!estudianteId },
  );

  const createPdfBlob = (base64Data: string) => {
    const bytes = Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: 'application/pdf' });
  };

  const handleDownloadOperational = async () => {
    try {
      const pdf = await api.reports.operationalReportPdf.query();
      saveAs(createPdfBlob(pdf), 'reporte_operacional.pdf');
    } catch (error) {
      console.error('Error descargando reporte operacional:', error);
    }
  };

  const handleDownloadManagement = async () => {
    try {
      const pdf = await api.reports.managementReportPdf.query();
      saveAs(createPdfBlob(pdf), 'reporte_gestion.pdf');
    } catch (error) {
      console.error('Error descargando reporte de gestión:', error);
    }
  };

  const handleDownloadStudent = async () => {
    if (!estudianteId) return;
    try {
      const pdf = await api.reports.studentReportPdf.query({ estudiante_id: estudianteId });
      saveAs(createPdfBlob(pdf), 'reporte_estudiante.pdf');
    } catch (error) {
      console.error('Error descargando reporte de estudiante:', error);
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-2 text-gray-600">
          Estadísticas globales y resumen consolidado por estudiante (datos desde PostgreSQL).
        </p>
        <div className="mt-4 space-x-4">
          <button
            onClick={handleDownloadOperational}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Exportar Reporte Operacional (PDF)
          </button>
          <button
            onClick={handleDownloadManagement}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Exportar Reporte de Gestión (PDF)
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Tesis aprobadas', key: 'tesis_aprobadas' as const },
          { label: 'Prácticas activas', key: 'practicas_activas' as const },
          { label: 'Empresas con convenio', key: 'empresas_con_convenio' as const },
          { label: 'Total estudiantes', key: 'total_estudiantes' as const },
          { label: 'Ofertas activas', key: 'total_ofertas_activas' as const },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {globalStats.isLoading ? '…' : (globalStats.data?.[key] ?? '—')}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Resumen por estudiante</h2>
        <select
          className="border rounded-lg px-3 py-2 w-full max-w-md"
          value={estudianteId}
          onChange={(e) => setEstudianteId(e.target.value)}
        >
          <option value="">Seleccionar estudiante…</option>
          {(estudiantes.data ?? []).map((st: { id: string; codigo_estudiante: string; nombre_completo: string }) => (
            <option key={st.id} value={st.id}>
              {st.codigo_estudiante} — {st.nombre_completo}
            </option>
          ))}
        </select>

        {summary.isFetching && <p className="text-sm text-gray-500">Cargando resumen…</p>}
        {summary.isError && (
          <p className="text-sm text-red-600">
            {(summary.error as { message?: string })?.message ?? 'No se pudo cargar el resumen'}
          </p>
        )}
        {summary.data && (
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Datos del estudiante</h3>
              <dl className="space-y-1 text-gray-700">
                <dt className="text-gray-500">Nombre</dt>
                <dd>{summary.data.estudiante?.nombre_completo ?? '—'}</dd>
                <dt className="text-gray-500">Correo</dt>
                <dd>{summary.data.estudiante?.correo ?? '—'}</dd>
                <dt className="text-gray-500">Código</dt>
                <dd>{summary.data.estudiante?.codigo_estudiante ?? '—'}</dd>
              </dl>
              <button
                onClick={handleDownloadStudent}
                className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Exportar Reporte de Estudiante (PDF)
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Prácticas ({summary.data.practicas?.length ?? 0})
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {(summary.data.practicas ?? []).map(
                  (p: { id: string; estado: string; oferta_titulo: string | null }) => (
                    <li key={p.id}>
                      {p.oferta_titulo ?? 'Sin oferta'} — <span className="text-gray-500">{p.estado}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-2">
                Tesis ({summary.data.tesis?.length ?? 0})
              </h3>
              <ul className="space-y-2">
                {(summary.data.tesis ?? []).map(
                  (t: { id: string; titulo: string; estado: string }) => (
                    <li key={t.id} className="border rounded-lg px-3 py-2">
                      <span className="font-medium">{t.titulo}</span>
                      <span className="text-gray-500 ml-2">{t.estado}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
