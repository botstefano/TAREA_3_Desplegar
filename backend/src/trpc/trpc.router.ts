import { INestApplication, Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import { PracticasService } from '../practicas/practicas.service';
import { TesisService } from '../tesis/tesis.service';
import { ReportsService } from '../reports/reports.service';

const estadoPractica = z.enum([
  'pendiente',
  'aprobada',
  'en_progreso',
  'finalizada',
  'rechazada',
]);

const estadoTesis = z.enum([
  'proyecto_registrado',
  'en_desarrollo',
  'sustentacion_programada',
  'aprobada',
  'observada',
]);

export function buildAppRouter(
  trpc: TrpcService,
  practicasService?: any,
  tesisService?: any,
  reportsService?: any,
) {
  return trpc.router({
    hello: trpc.procedure
      .input(z.object({ name: z.string().optional() }))
      .query(({ input }) => {
        return {
          greeting: `Hola ${input.name || 'Usuario'} desde UNT Gestion`,
        };
      }),

    empresas: trpc.router({
      list: trpc.procedure.query(() => practicasService.findAllEmpresas()),
      create: trpc.procedure
        .input(
          z.object({
            ruc: z.string().min(11).max(11),
            razon_social: z.string().min(1),
            direccion: z.string().optional().nullable(),
            representante_nombre: z.string().optional().nullable(),
            correo_contacto: z.string().optional().nullable(),
            tiene_convenio: z.boolean().optional(),
            tipo_convenio: z.string().optional().nullable(),
          }),
        )
        .mutation(({ input }) =>
          practicasService.createEmpresa({
            ruc: input.ruc,
            razon_social: input.razon_social,
            direccion: input.direccion ?? null,
            representante_nombre: input.representante_nombre ?? null,
            correo_contacto: input.correo_contacto ?? null,
            tiene_convenio: input.tiene_convenio ?? null,
            tipo_convenio: input.tipo_convenio ?? null,
          }),
        ),
    }),

    ofertas: trpc.router({
      list: trpc.procedure.query(() => practicasService.findAllOfertas()),
      create: trpc.procedure
        .input(
          z.object({
            empresa_id: z.string().uuid(),
            titulo: z.string().min(1),
            descripcion: z.string().min(1),
            requisitos: z.string().optional().nullable(),
            fecha_inicio: z.string().optional().nullable(),
            fecha_fin: z.string().optional().nullable(),
            vacantes: z.number().int().positive().optional().nullable(),
          }),
        )
        .mutation(({ input }) =>
          practicasService.createOferta({
            empresa_id: input.empresa_id,
            titulo: input.titulo,
            descripcion: input.descripcion,
            requisitos: input.requisitos ?? null,
            fecha_inicio: input.fecha_inicio ?? null,
            fecha_fin: input.fecha_fin ?? null,
            vacantes: input.vacantes ?? null,
          }),
        ),
      update: trpc.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            titulo: z.string().min(1).optional(),
            descripcion: z.string().min(1).optional(),
            requisitos: z.string().nullable().optional(),
            fecha_inicio: z.string().nullable().optional(),
            fecha_fin: z.string().nullable().optional(),
            vacantes: z.number().int().positive().nullable().optional(),
            activo: z.boolean().optional(),
          }),
        )
        .mutation(({ input }) => {
          const { id, ...patch } = input;
          return practicasService.updateOferta(id, patch);
        }),
      delete: trpc.procedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => practicasService.deleteOferta(input.id)),
    }),

    estudiantes: trpc.router({
      list: trpc.procedure.query(() => practicasService.findAllEstudiantes()),
    }),

    practicas: trpc.router({
      list: trpc.procedure.query(() => practicasService.findAllPracticas()),
      metrics: trpc.procedure.query(() => practicasService.getMetrics()),
      create: trpc.procedure
        .input(
          z.object({
            estudiante_id: z.string().uuid(),
            oferta_id: z.string().uuid(),
            asesor_id: z.string().uuid().optional().nullable(),
            fecha_inicio: z.string().optional().nullable(),
            fecha_fin_estimada: z.string().optional().nullable(),
            horas_totales: z.number().int().min(0).optional().nullable(),
          }),
        )
        .mutation(({ input }) =>
          practicasService.createPractica({
            estudiante_id: input.estudiante_id,
            oferta_id: input.oferta_id,
            asesor_id: input.asesor_id ?? null,
            fecha_inicio: input.fecha_inicio ?? null,
            fecha_fin_estimada: input.fecha_fin_estimada ?? null,
            horas_totales: input.horas_totales ?? null,
          }),
        ),
      updateEstado: trpc.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            estado: estadoPractica,
          }),
        )
        .mutation(({ input }) =>
          practicasService.updatePracticaEstado(input.id, input.estado),
        ),
      update: trpc.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            asesor_id: z.string().uuid().nullable().optional(),
            fecha_inicio: z.string().nullable().optional(),
            fecha_fin_estimada: z.string().nullable().optional(),
            horas_totales: z.number().int().min(0).nullable().optional(),
            informe_final_url: z.string().nullable().optional(),
            evaluacion_puntuacion: z.number().nullable().optional(),
            comentarios_asesor: z.string().nullable().optional(),
          }),
        )
        .mutation(({ input }) => {
          const { id, ...patch } = input;
          return practicasService.updatePractica(id, patch);
        }),
      delete: trpc.procedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => practicasService.deletePractica(input.id)),
    }),

    tesis: trpc.router({
      list: trpc.procedure.query(() => tesisService.findAllTesis()),
      metrics: trpc.procedure.query(() => tesisService.getMetrics()),
      listAsesores: trpc.procedure.query(() => tesisService.listUsuariosAsesores()),
      create: trpc.procedure
        .input(
          z.object({
            titulo: z.string().min(1),
            estudiante_id: z.string().uuid(),
            asesor_id: z.string().uuid().optional().nullable(),
            archivo_proyecto_url: z.string().optional().nullable(),
          }),
        )
        .mutation(({ input }) =>
          tesisService.createTesis({
            titulo: input.titulo,
            estudiante_id: input.estudiante_id,
            asesor_id: input.asesor_id ?? null,
            archivo_proyecto_url: input.archivo_proyecto_url ?? null,
          }),
        ),
      updateEstado: trpc.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            estado: estadoTesis,
          }),
        )
        .mutation(({ input }) => tesisService.updateTesisEstado(input.id, input.estado)),
      update: trpc.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            titulo: z.string().min(1).optional(),
            asesor_id: z.string().uuid().nullable().optional(),
            archivo_proyecto_url: z.string().nullable().optional(),
            fecha_sustentacion: z.string().nullable().optional(),
            nota_final: z.number().nullable().optional(),
          }),
        )
        .mutation(({ input }) => {
          const { id, ...patch } = input;
          return tesisService.updateTesis(id, patch);
        }),
      delete: trpc.procedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => tesisService.deleteTesis(input.id)),

      avancesByTesis: trpc.procedure
        .input(z.object({ tesis_id: z.string().uuid() }))
        .query(({ input }) => tesisService.findAvancesByTesis(input.tesis_id)),
      createAvance: trpc.procedure
        .input(
          z.object({
            tesis_id: z.string().uuid(),
            titulo: z.string().min(1),
            descripcion: z.string().optional().nullable(),
            archivo_url: z.string().optional().nullable(),
            aprobado: z.boolean().optional().nullable(),
          }),
        )
        .mutation(({ input }) =>
          tesisService.createAvance({
            tesis_id: input.tesis_id,
            titulo: input.titulo,
            descripcion: input.descripcion ?? null,
            archivo_url: input.archivo_url ?? null,
            aprobado: input.aprobado ?? null,
          }),
        ),
      updateAvance: trpc.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            titulo: z.string().min(1).optional(),
            descripcion: z.string().nullable().optional(),
            archivo_url: z.string().nullable().optional(),
            comentarios_asesor: z.string().nullable().optional(),
            aprobado: z.boolean().nullable().optional(),
          }),
        )
        .mutation(({ input }) => {
          const { id, ...patch } = input;
          return tesisService.updateAvance(id, patch);
        }),
      deleteAvance: trpc.procedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => tesisService.deleteAvance(input.id)),

      juradosByTesis: trpc.procedure
        .input(z.object({ tesis_id: z.string().uuid() }))
        .query(({ input }) => tesisService.findJuradosByTesis(input.tesis_id)),
      addJurado: trpc.procedure
        .input(
          z.object({
            tesis_id: z.string().uuid(),
            usuario_id: z.string().uuid(),
          }),
        )
        .mutation(({ input }) =>
          tesisService.addJurado(input.tesis_id, input.usuario_id),
        ),
      removeJurado: trpc.procedure
        .input(
          z.object({
            tesis_id: z.string().uuid(),
            usuario_id: z.string().uuid(),
          }),
        )
        .mutation(({ input }) =>
          tesisService.removeJurado(input.tesis_id, input.usuario_id),
        ),
    }),

    reports: trpc.router({
      globalStats: trpc.procedure.query(() => reportsService.generateGlobalStats()),
      studentSummary: trpc.procedure
        .input(z.object({ estudiante_id: z.string().uuid() }))
        .query(({ input }) => reportsService.getStudentSummary(input.estudiante_id)),
      studentReportPdf: trpc.procedure
        .input(z.object({ estudiante_id: z.string().uuid() }))
        .query(({ input }) => reportsService.generateStudentReport(input.estudiante_id)),
      operationalReportPdf: trpc.procedure.query(() => reportsService.generateOperationalReport()),
      managementReportPdf: trpc.procedure.query(() => reportsService.generateManagementReport()),
    }),
  });
}

export type AppRouter = ReturnType<typeof buildAppRouter>;

@Injectable()
export class TrpcRouter {
  readonly appRouter: AppRouter;

  constructor(
    private readonly trpc: TrpcService,
  ) {
    this.appRouter = buildAppRouter(
      this.trpc,
    );
  }

  async applyMiddleware(app: INestApplication) {
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
      }),
    );
  }
}
