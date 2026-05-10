import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { TRPCError } from '@trpc/server';

export type EstadoTesis =
  | 'proyecto_registrado'
  | 'en_desarrollo'
  | 'sustentacion_programada'
  | 'aprobada'
  | 'observada';

@Injectable()
export class TesisService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async findAllTesis() {
    const { rows } = await this.pool.query(
      `SELECT t.*,
              e.codigo_estudiante,
              TRIM(CONCAT(u_est.nombre, ' ', u_est.apellidos)) AS estudiante_nombre,
              TRIM(CONCAT(u_ase.nombre, ' ', u_ase.apellidos)) AS asesor_nombre
       FROM tesis t
       LEFT JOIN estudiantes e ON e.id = t.estudiante_id
       LEFT JOIN usuarios u_est ON u_est.id = e.id
       LEFT JOIN usuarios u_ase ON u_ase.id = t.asesor_id
       ORDER BY t.fecha_registro DESC NULLS LAST, t.id`,
    );
    return rows;
  }

  async createTesis(input: {
    titulo: string;
    estudiante_id: string;
    asesor_id?: string | null;
    archivo_proyecto_url?: string | null;
  }) {
    try {
      const {
        rows: [row],
      } = await this.pool.query(
        `INSERT INTO tesis (titulo, estudiante_id, asesor_id, archivo_proyecto_url)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [
          input.titulo,
          input.estudiante_id,
          input.asesor_id ?? null,
          input.archivo_proyecto_url ?? null,
        ],
      );
      return row;
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === '23503') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Estudiante o asesor no existe',
        });
      }
      throw e;
    }
  }

  async updateTesisEstado(id: string, estado: EstadoTesis) {
    const {
      rows: [row],
    } = await this.pool.query(
      `UPDATE tesis SET estado = $1::estado_tesis WHERE id = $2 RETURNING *`,
      [estado, id],
    );
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Tesis no encontrada' });
    }
    return row;
  }

  async updateTesis(
    id: string,
    patch: Partial<{
      titulo: string;
      asesor_id: string | null;
      archivo_proyecto_url: string | null;
      fecha_sustentacion: string | null;
      nota_final: number | null;
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
    if (patch.asesor_id !== undefined) push('asesor_id', patch.asesor_id);
    if (patch.archivo_proyecto_url !== undefined)
      push('archivo_proyecto_url', patch.archivo_proyecto_url);
    if (patch.fecha_sustentacion !== undefined)
      push('fecha_sustentacion', patch.fecha_sustentacion);
    if (patch.nota_final !== undefined) push('nota_final', patch.nota_final);

    if (!fields.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Sin campos para actualizar' });
    }
    values.push(id);
    const {
      rows: [row],
    } = await this.pool.query(
      `UPDATE tesis SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Tesis no encontrada' });
    }
    return row;
  }

  async deleteTesis(id: string) {
    const { rowCount } = await this.pool.query(`DELETE FROM tesis WHERE id = $1`, [id]);
    if (!rowCount) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Tesis no encontrada' });
    }
    return { ok: true as const };
  }

  async findAvancesByTesis(tesis_id: string) {
    const { rows } = await this.pool.query(
      `SELECT * FROM avances_tesis WHERE tesis_id = $1 ORDER BY fecha_entrega DESC`,
      [tesis_id],
    );
    return rows;
  }

  async createAvance(input: {
    tesis_id: string;
    titulo: string;
    descripcion?: string | null;
    archivo_url?: string | null;
    aprobado?: boolean | null;
  }) {
    const {
      rows: [row],
    } = await this.pool.query(
      `INSERT INTO avances_tesis (tesis_id, titulo, descripcion, archivo_url, aprobado)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        input.tesis_id,
        input.titulo,
        input.descripcion ?? null,
        input.archivo_url ?? null,
        input.aprobado ?? false,
      ],
    );
    return row;
  }

  async updateAvance(
    id: string,
    patch: Partial<{
      titulo: string;
      descripcion: string | null;
      archivo_url: string | null;
      comentarios_asesor: string | null;
      aprobado: boolean | null;
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
    if (patch.archivo_url !== undefined) push('archivo_url', patch.archivo_url);
    if (patch.comentarios_asesor !== undefined)
      push('comentarios_asesor', patch.comentarios_asesor);
    if (patch.aprobado !== undefined) push('aprobado', patch.aprobado);

    if (!fields.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Sin campos para actualizar' });
    }
    values.push(id);
    const {
      rows: [row],
    } = await this.pool.query(
      `UPDATE avances_tesis SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Avance no encontrado' });
    }
    return row;
  }

  async deleteAvance(id: string) {
    const { rowCount } = await this.pool.query(`DELETE FROM avances_tesis WHERE id = $1`, [id]);
    if (!rowCount) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Avance no encontrado' });
    }
    return { ok: true as const };
  }

  async findJuradosByTesis(tesis_id: string) {
    const { rows } = await this.pool.query(
      `SELECT j.*, TRIM(CONCAT(u.nombre, ' ', u.apellidos)) AS jurado_nombre, u.correo AS jurado_correo
       FROM jurados_tesis j
       JOIN usuarios u ON u.id = j.usuario_id
       WHERE j.tesis_id = $1`,
      [tesis_id],
    );
    return rows;
  }

  async addJurado(tesis_id: string, usuario_id: string) {
    try {
      await this.pool.query(`INSERT INTO jurados_tesis (tesis_id, usuario_id) VALUES ($1,$2)`, [
        tesis_id,
        usuario_id,
      ]);
      return { ok: true as const };
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === '23505') {
        throw new TRPCError({ code: 'CONFLICT', message: 'El jurado ya está asignado' });
      }
      if (err.code === '23503') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tesis o usuario no existe',
        });
      }
      throw e;
    }
  }

  async removeJurado(tesis_id: string, usuario_id: string) {
    const { rowCount } = await this.pool.query(
      `DELETE FROM jurados_tesis WHERE tesis_id = $1 AND usuario_id = $2`,
      [tesis_id, usuario_id],
    );
    if (!rowCount) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Jurado no asignado a esta tesis' });
    }
    return { ok: true as const };
  }

  async getMetrics() {
    const { rows } = await this.pool.query<{ estado: string; count: string }>(
      `SELECT estado::text AS estado, COUNT(*)::text AS count FROM tesis GROUP BY estado`,
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
      proyecto_registrado: by_estado['proyecto_registrado'] ?? 0,
      en_desarrollo: by_estado['en_desarrollo'] ?? 0,
      sustentacion_programada: by_estado['sustentacion_programada'] ?? 0,
      aprobadas: by_estado['aprobada'] ?? 0,
      observadas: by_estado['observada'] ?? 0,
    };
  }

  async listUsuariosAsesores() {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, apellidos, correo FROM usuarios WHERE rol = 'asesor'::rol_usuario AND activo = TRUE ORDER BY apellidos, nombre`,
    );
    return rows;
  }
}
