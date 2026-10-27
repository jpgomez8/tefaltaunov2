import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { configureHttp } from '../src/config/http.js';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Lista del escenario de prueba, independiente del .env de cada colaborador.
    app.get(ConfigService).set('FRONTEND_ORIGINS', [
      'http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:55922',
    ]);
    configureHttp(app);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET) consulta la base real', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect({ status: 'ok', database: 'up' });
  });

  it('consulta los catalogos por Prisma usando el rol limitado', async () => {
    const db = app.get(PrismaService);
    const counts = await Promise.all([
      db.paises.count(), db.regiones.count(), db.comunas.count(), db.actividades.count(),
    ]);
    expect(counts).toEqual([1, 16, 346, 40]);
    const identity = await db.$queryRaw`
      SELECT current_user AS usuario,
        has_schema_privilege(current_user, 'public', 'CREATE') AS puede_crear,
        has_table_privilege(current_user, 'public._prisma_migrations', 'SELECT') AS acceso_migraciones
    `;
    expect(identity).toEqual([{
      usuario: 'comunidad_deportiva_app', puede_crear: false, acceso_migraciones: false,
    }]);
  });

  it.each(['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:55922'])('permite consultar desde %s', (origin) => {
    return request(app.getHttpServer()).get('/health').set('Origin', origin)
      .expect(200).expect('Access-Control-Allow-Origin', origin);
  });

  it('atiende el preflight del frontend', () => {
    return request(app.getHttpServer()).options('/health')
      .set('Origin', 'http://localhost:4200')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://localhost:4200');
  });

  it('no autoriza a otro origen a leer la respuesta en el navegador', async () => {
    const response = await request(app.getHttpServer()).get('/health')
      .set('Origin', 'https://otro-origen.example').expect(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
