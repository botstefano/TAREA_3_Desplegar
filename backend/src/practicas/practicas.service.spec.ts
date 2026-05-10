import { describe, it, expect, vi } from 'vitest';
import { PracticasService } from './practicas.service';

describe('PracticasService.getMetrics', () => {
  it('agrupa conteos por estado', async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({
        rows: [
          { estado: 'pendiente', count: '2' },
          { estado: 'en_progreso', count: '3' },
        ],
      }),
    };
    const svc = new PracticasService(pool as never);
    const m = await svc.getMetrics();
    expect(m.total).toBe(5);
    expect(m.en_progreso).toBe(3);
    expect(m.pendientes).toBe(2);
  });
});
