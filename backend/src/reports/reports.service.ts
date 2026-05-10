import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { TRPCError } from '@trpc/server';
import puppeteer from 'puppeteer';

export type GlobalStatsRow = {
  tesis_aprobadas: number;
  practicas_activas: number;
  empresas_con_convenio: number;
  total_estudiantes: number;
  total_ofertas_activas: number;
};

@Injectable()
export class ReportsService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async generateGlobalStats(): Promise<GlobalStatsRow> {
    const [
      tesisRes,
      practRes,
      empRes,
      estRes,
      ofertRes,
    ] = await Promise.all([
      this.pool.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM tesis WHERE estado = 'aprobada'::estado_tesis`,
      ),
      this.pool.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM practicas WHERE estado IN ('aprobada'::estado_practica, 'en_progreso'::estado_practica)`,
      ),
      this.pool.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM empresas WHERE tiene_convenio = TRUE`,
      ),
      this.pool.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM estudiantes`),
      this.pool.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM ofertas_practicas WHERE activo = TRUE`,
      ),
    ]);

    return {
      tesis_aprobadas: parseInt(tesisRes.rows[0]?.c ?? '0', 10),
      practicas_activas: parseInt(practRes.rows[0]?.c ?? '0', 10),
      empresas_con_convenio: parseInt(empRes.rows[0]?.c ?? '0', 10),
      total_estudiantes: parseInt(estRes.rows[0]?.c ?? '0', 10),
      total_ofertas_activas: parseInt(ofertRes.rows[0]?.c ?? '0', 10),
    };
  }

  async getStudentSummary(estudiante_id: string) {
    const {
      rows: [est],
    } = await this.pool.query(
      `SELECT e.*, TRIM(CONCAT(u.nombre, ' ', u.apellidos)) AS nombre_completo, u.correo
       FROM estudiantes e JOIN usuarios u ON u.id = e.id WHERE e.id = $1`,
      [estudiante_id],
    );
    if (!est) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Estudiante no encontrado' });
    }

    const [practicas, tesisList] = await Promise.all([
      this.pool.query(
        `SELECT p.*, o.titulo AS oferta_titulo FROM practicas p
         LEFT JOIN ofertas_practicas o ON o.id = p.oferta_id WHERE p.estudiante_id = $1`,
        [estudiante_id],
      ),
      this.pool.query(`SELECT * FROM tesis WHERE estudiante_id = $1 ORDER BY fecha_registro DESC`, [
        estudiante_id,
      ]),
    ]);

    return {
      estudiante: est,
      practicas: practicas.rows,
      tesis: tesisList.rows,
    };
  }

  private async renderHtmlToPdf(html: string): Promise<string> {
    const executablePath =
      process.env.CHROMIUM_PATH ??
      process.env.PUPPETEER_EXECUTABLE_PATH ??
      '/usr/bin/chromium-browser';

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer.toString('base64');
  }

  async generateStudentReport(studentId: string): Promise<string> {
    const summary = await this.getStudentSummary(studentId);
    const html = `
      <html>
        <head><title>Reporte de Estudiante</title></head>
        <body>
          <h1>Reporte de Estudiante: ${summary.estudiante.nombre_completo}</h1>
          <p>Código: ${summary.estudiante.codigo_estudiante}</p>
          <p>Facultad: ${summary.estudiante.facultad}</p>
          <h2>Prácticas</h2>
          <ul>
            ${summary.practicas.map(p => `<li>${p.oferta_titulo} - Estado: ${p.estado}</li>`).join('')}
          </ul>
          <h2>Tesis</h2>
          <ul>
            ${summary.tesis.map(t => `<li>${t.titulo} - Estado: ${t.estado}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
    return this.renderHtmlToPdf(html);
  }

  async generateOperationalReport(): Promise<string> {
    const stats = await this.generateGlobalStats();
    const html = `
      <html>
        <head><title>Reporte Operacional</title></head>
        <body>
          <h1>Reporte Operacional - UNT Gestión</h1>
          <p>Fecha: ${new Date().toLocaleDateString()}</p>
          <h2>Estadísticas Generales</h2>
          <ul>
            <li>Total Estudiantes: ${stats.total_estudiantes}</li>
            <li>Prácticas Activas: ${stats.practicas_activas}</li>
            <li>Ofertas Activas: ${stats.total_ofertas_activas}</li>
            <li>Tesis Aprobadas: ${stats.tesis_aprobadas}</li>
            <li>Empresas con Convenio: ${stats.empresas_con_convenio}</li>
          </ul>
        </body>
      </html>
    `;
    return this.renderHtmlToPdf(html);
  }

  async generateManagementReport(): Promise<string> {
    const [usersRes, tesisRes, practicasRes] = await Promise.all([
      this.pool.query(`SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol`),
      this.pool.query(`SELECT estado, COUNT(*) as count FROM tesis GROUP BY estado`),
      this.pool.query(`SELECT estado, COUNT(*) as count FROM practicas GROUP BY estado`),
    ]);
    const html = `
      <html>
        <head><title>Reporte de Gestión</title></head>
        <body>
          <h1>Reporte de Gestión - UNT Gestión</h1>
          <p>Fecha: ${new Date().toLocaleDateString()}</p>
          <h2>Usuarios por Rol</h2>
          <ul>
            ${usersRes.rows.map(u => `<li>${u.rol}: ${u.count}</li>`).join('')}
          </ul>
          <h2>Tesis por Estado</h2>
          <ul>
            ${tesisRes.rows.map(t => `<li>${t.estado}: ${t.count}</li>`).join('')}
          </ul>
          <h2>Prácticas por Estado</h2>
          <ul>
            ${practicasRes.rows.map(p => `<li>${p.estado}: ${p.count}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
    return this.renderHtmlToPdf(html);
  }
}
