import { Inject, Injectable } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, PrismaPg } from '@comunidad/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(ConfigService) config: ConfigService) {
    const adapter = new PrismaPg({
      host: config.getOrThrow<string>('DB_HOST'),
      port: config.getOrThrow<number>('DB_PORT'),
      database: config.getOrThrow<string>('DB_NAME'),
      user: config.getOrThrow<string>('DB_USER'),
      password: config.getOrThrow<string>('DB_PASSWORD'),
      connectionTimeoutMillis: 3000,
      query_timeout: 3000,
      statement_timeout: 3000,
      max: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // Fuerza una consulta real: crear el pool por si solo no prueba la conexion.
      await this.$queryRaw`SELECT 1`;
    } catch {
      await this.$disconnect().catch(() => undefined);
      throw new Error('No se pudo conectar a PostgreSQL. Revisa Docker y la configuracion local del backend.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
