import { Test } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('Estado de la base de datos', () => {
  it('responde correctamente cuando la consulta tiene exito', async () => {
    const query = vi.fn().mockResolvedValue([{ result: 1 }]);
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: { $queryRaw: query } }],
    }).compile();
    try {
      await expect(module.get(HealthController).check()).resolves.toEqual({ status: 'ok', database: 'up' });
    } finally { await module.close(); }
  });

  it('devuelve 503 sin revelar el error interno de conexion', async () => {
    const query = vi.fn().mockRejectedValue(new Error('password=secreto-interno host=privado'));
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: { $queryRaw: query } }],
    }).compile();
    try {
      let caught: unknown;
      try { await module.get(HealthController).check(); } catch (error) { caught = error; }
      expect(caught).toBeInstanceOf(ServiceUnavailableException);
      const response = caught as ServiceUnavailableException;
      expect(response.getStatus()).toBe(503);
      expect(response.getResponse()).toEqual({ status: 'error', database: 'down' });
      expect(JSON.stringify(response.getResponse())).not.toContain('secreto-interno');
    } finally { await module.close(); }
  });
});
