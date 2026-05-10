import { describe, it, expect, vi } from 'vitest';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('generateGlobalStats agrega conteos de todas las consultas', async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rows: [{ c: '5' }] }),
    };
    const svc = new ReportsService(pool as never);
    const stats = await svc.generateGlobalStats();
    expect(stats.tesis_aprobadas).toBe(5);
    expect(stats.practicas_activas).toBe(5);
    expect(stats.empresas_con_convenio).toBe(5);
    expect(stats.total_estudiantes).toBe(5);
    expect(stats.total_ofertas_activas).toBe(5);
    expect(pool.query).toHaveBeenCalledTimes(5);
  });
});
