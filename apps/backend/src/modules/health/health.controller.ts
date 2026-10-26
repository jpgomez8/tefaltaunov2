import { Controller, Get, Header, Inject, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      // No exponer mensajes internos, consultas ni detalles de conexion.
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
  }
}
