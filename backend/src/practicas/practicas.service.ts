import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { TRPCError } from '@trpc/server';

export type EstadoPractica =
  | 'pendiente'
  | 'aprobada'
  | 'en_progreso'
  | 'finalizada'
  | 'rechazada';

@Injectable()
export class PracticasService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async createEmpresa(input: {
    ruc: string;
    razon_social: string;
    direccion?: string | null;
    representante_nombre?: string | null;
    correo_contacto?: string | null;
    tiene_convenio?: boolean | null;
    tipo_convenio?: string | null;
  }) {
    try {
      const {
        rows: [row],
      } = await this.pool.query(
        `INSERT INTO empresas (ruc, razon_social, direccion, representante_nombre, correo_contacto, tiene_convenio, tipo_convenio)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          input.ruc,
          input.razon_social,
          input.direccion ?? null,
          input.representante_nombre ?? null,
          input.correo_contacto ?? null,
          input.tiene_convenio ?? false,
          input.tipo_convenio ?? null,
        ],
      );
      return row;
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === '23505') {
        throw new TRPCError({ code: 'CONFLICT', message: 'RUC o empresa ya registrada' });
      }
      throw e;
    }
  }

  async findAllEmpresas() {
    const { rows } = await this.pool.query(
      `SELECT id, razon_social, ruc, tiene_convenio FROM empresas ORDER BY razon_social`,
    );
    return rows;
  }

  async findAllEstudiantes() {
    const { rows } = await this.pool.query(
      `SELECT e.id, e.codigo_estudiante, e.facultad, e.escuela,
              TRIM(CONCAT(u.nombre, ' ', u.apellidos)) AS nombre_completo
       FROM estudiantes e
       JOIN usuarios u ON u.id = e.id
       ORDER BY e.codigo_estudiante`,
    );
    return rows;
  }

  async findAllOfertas() {
    const { rows } = await this.pool.query(
      `SELECT o.*, e.razon_social AS empresa_nombre, e.ruc AS empresa_ruc
       FROM ofertas_practicas o
       LEFT JOIN empresas e ON e.id = o.empresa_id
       ORDER BY o.fecha_publicacion DESC NULLS LAST, o.titulo`,
    );
    return rows;
  }

  async createOferta(input: {
    empresa_id: string;
    titulo: string;
    descripcion: string;
    requisitos?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    vacantes?: number | null;
  }) {
    const {
      rows: [row],
    } = await this.pool.query(
      `INSERT INTO ofertas_practicas (empresa_id, titulo, descripcion, requisitos, fecha_inicio, fecha_fin, vacantes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        input.empresa_id,
        input.titulo,
        input.descripcion,
        input.requisitos ?? null,
        input.fecha_inicio ?? null,
        input.fecha_fin ?? null,
        input.vacantes ?? 1,
      ],
    );
    return row;
  }

  async updateOferta(
    id: string,
    patch: Partial<{
      titulo: string;
      descripcion: string;
      requisitos: string | null;
      fecha_inicio: string | null;
      fecha_fin: string | null;
      vacantes: number | null;
      activo: boolean;
    }>,
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    const push = (col: string, val: unknown) => {
      fields.push(`${col} = $${i++}`);
      values.push(val);
    };
    if (patch.titulo !== undefined) push('titulo', patch.titulo);
    if (patch.descripcion !== undefined) push('descripcion', patch.descripcion);
    if (patch.requisitos !== undefined) push('requisitos', patch.requisitos);
    if (patch.fecha_inicio !== undefined) push('fecha_inicio', patch.fecha_inicio);
    if (patch.fecha_fin !== undefined) push('fecha_fin', patch.fecha_fin);
    if (patch.vacantes !== undefined) push('vacantes', patch.vacantes);
    if (patch.activo !== undefined) push('activo', patch.activo);

    if (!fields.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Sin campos para actualizar' });
    }

    values.push(id);
    const {
      rows: [row],
    } = await this.pool.query(
      `UPDATE ofertas_practicas SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Oferta no encontrada' });
    }
    return row;
  }

  async deleteOferta(id: string) {
    const { rowCount } = await this.pool.query(`DELETE FROM ofertas_practicas WHERE id = $1`, [id]);
    if (!rowCount) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Oferta no encontrada' });
    }
    return { ok: true as const };
  }

  async findAllPracticas() {
    const { rows } = await this.pool.query(
      `SELECT p.*,
              e.codigo_estudiante,
              TRIM(CONCAT(u_est.nombre, ' ', u_est.apellidos)) AS estudiante_nombre,
              o.titulo AS oferta_titulo,
              emp.razon_social AS empresa_nombre
       FROM practicas p
       LEFT JOIN estudiantes e ON e.id = p.estudiante_id
       LEFT JOIN usuarios u_est ON u_est.id = e.id
       LEFT JOIN ofertas_practicas o ON o.id = p.oferta_id
       LEFT JOIN empresas emp ON emp.id = o.empresa_id
       ORDER BY p.fecha_inicio DESC NULLS LAST, p.id`,
    );
    return rows;
  }

  async createPractica(input: {
    estudiante_id: string;
    oferta_id: string;
    asesor_id?: string | null;
    fecha_inicio?: string | null;
    fecha_fin_estimada?: string | null;
    horas_totales?: number | null;
  }) {
    try {
      const {
        rows: [row],
      } = await this.pool.query(
        `INSERT INTO practicas (estudiante_id, oferta_id, asesor_id, fecha_inicio, fecha_fin_estimada, horas_totales)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [
          input.estudiante_id,
          input.oferta_id,
          input.asesor_id ?? null,
          input.fecha_inicio ?? null,
          input.fecha_fin_estimada ?? null,
          input.horas_totales ?? 0,
        ],
      );
      return row;
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === '23503') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Datos inválidos: estudiante, oferta o asesor no existe',
        });
      }
      throw e;
    }
  }

  async updatePracticaEstado(id: string, estado: EstadoPractica) {
    const {
      rows: [row],
    } = await this.pool.query(
      `UPDATE practicas SET estado = $1::estado_practica WHERE id = $2 RETURNING *`,
      [estado, id],
    );
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Práctica no encontrada' });
    }
    return row;
  }

  async updatePractica(
    id: string,
    patch: Partial<{
      asesor_id: string | null;
      fecha_inicio: string | null;
      fecha_fin_estimada: string | null;
      horas_totales: number | null;
      informe_final_url: string | null;
      evaluacion_puntuacion: number | null;
      comentarios_asesor: string | null;
    }>,
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    const push = (col: string, val: unknown) => {
      fields.push(`${col} = $${i++}`);
      values.push(val);
    };
    if (patch.asesor_id !== undefined) push('asesor_id', patch.asesor_id);
    if (patch.fecha_inicio !== undefined) push('fecha_inicio', patch.fecha_inicio);
    if (patch.fecha_fin_estimada !== undefined)
      push('fecha_fin_estimada', patch.fecha_fin_estimada);
    if (patch.horas_totales !== undefined) push('horas_totales', patch.horas_totales);
    if (patch.informe_final_url !== undefined) push('informe_final_url', patch.informe_final_url);
    if (patch.evaluacion_puntuacion !== undefined)
      push('evaluacion_puntuacion', patch.evaluacion_puntuacion);
    if (patch.comentarios_asesor !== undefined)
      push('comentarios_asesor', patch.comentarios_asesor);

    if (!fields.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Sin campos para actualizar' });
    }
    values.push(id);
    const {
      rows: [row],
    } = await this.pool.query(
      `UPDATE practicas SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Práctica no encontrada' });
    }
    return row;
  }

  async deletePractica(id: string) {
    const { rowCount } = await this.pool.query(`DELETE FROM practicas WHERE id = $1`, [id]);
    if (!rowCount) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Práctica no encontrada' });
    }
    return { ok: true as const };
  }

  async getMetrics() {
    const { rows } = await this.pool.query<{ estado: string; count: string }>(
      `SELECT estado::text AS estado, COUNT(*)::text AS count FROM practicas GROUP BY estado`,
    );
    const by_estado: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      const n = parseInt(r.count, 10);
      by_estado[r.estado] = n;
      total += n;
    }
    return {
      total,
      by_estado,
      en_progreso: by_estado['en_progreso'] ?? 0,
      finalizadas: by_estado['finalizada'] ?? 0,
      pendientes: by_estado['pendiente'] ?? 0,
      aprobadas: by_estado['aprobada'] ?? 0,
      rechazadas: by_estado['rechazada'] ?? 0,
    };
  }

  /** @deprecated usar findAllPracticas */
  async findAll() {
    return this.findAllPracticas();
  }
}
