import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { AuthController } from '../src/modules/auth/auth.controller.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { configureHttp } from '../src/config/http.js';

describe('Autenticación real (sin conservar datos de prueba)', () => {
  it('registra, valida, inicia, recupera y revoca una sesión contra PostgreSQL', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const owner = module.createNestApplication();
    await owner.init();
    const db = owner.get(PrismaService);
    const rollback = new Error('rollback de prueba');
    try {
      await expect(
        db.$transaction(
          async (tx) => {
            const proxy = new Proxy(tx, {
              get(target, key) {
                if (key === '$transaction')
                  return (fn: (client: typeof tx) => unknown) => fn(tx);
                return Reflect.get(target, key);
              },
            });
            const fixture = await Test.createTestingModule({
              imports: [ConfigModule],
              controllers: [AuthController],
              providers: [
                {
                  provide: AuthService,
                  useValue: new AuthService(proxy as unknown as PrismaService),
                },
                {
                  provide: ConfigService,
                  useValue: new ConfigService({
                    FRONTEND_ORIGINS: ['http://localhost:4200'],
                  }),
                },
              ],
            }).compile();
            const app = fixture.createNestApplication();
            app
              .get(ConfigService)
              .set('FRONTEND_ORIGINS', ['http://localhost:4200']);
            configureHttp(app);
            await app.init();
            const server = app.getHttpServer();
            const correo = `auth-${randomUUID()}@example.test`;
            const data = {
              nombre_publico: 'Prueba Falta Uno',
              correo,
              password: 'Una frase muy larga para pruebas',
              mayoria_edad: true,
            };
            const post = (path: string) =>
              request(server)
                .post(`/auth/${path}`)
                .set('X-Falta-Uno', '1')
                .set('Origin', 'http://localhost:4200');
            try {
              await request(server).get('/auth/me').expect(401);
              await request(server)
                .post('/auth/register')
                .send(data)
                .expect(403);
              await request(server)
                .post('/auth/register')
                .set('X-Falta-Uno', '1')
                .set('Origin', 'https://otro.example')
                .send(data)
                .expect(403);
              await post('register')
                .send({ ...data, rol: 'administrador' })
                .expect(400);
              await post('register')
                .send({ ...data, password: 'corta' })
                .expect(400);
              const created = await post('register')
                .send({ ...data, correo: correo.toUpperCase() })
                .expect(201);
              expect(created.body.usuario.correo).toBe(correo);
              expect(created.body.usuario.password_hash).toBeUndefined();
              const stored = await tx.usuarios.findUniqueOrThrow({
                where: { correo },
              });
              expect(stored.password_hash).toMatch(/^scrypt\$/);
              expect(stored.password_hash).not.toContain(data.password);
              expect(stored.rol).toBe('usuario');
              await tx.$executeRawUnsafe('SAVEPOINT duplicate_registration');
              await post('register').send(data).expect(409);
              await tx.$executeRawUnsafe(
                'ROLLBACK TO SAVEPOINT duplicate_registration',
              );
              await post('login')
                .send({ correo, password: 'incorrecta' })
                .expect(401);
              const logged = await post('login')
                .send({ correo, password: data.password })
                .expect(200);
              const cookies = logged.headers[
                'set-cookie'
              ] as unknown as string[];
              expect(cookies[0]).toContain('HttpOnly');
              expect(cookies[0]).toContain('SameSite=Lax');
              const cookie = cookies[0].split(';')[0];
              const session = await tx.sesiones.findFirstOrThrow({
                where: { usuario_id: stored.id },
              });
              expect(cookie).not.toContain(session.token_renovacion_hash);
              await request(server)
                .get('/auth/me')
                .set('Cookie', cookie)
                .expect(200);
              await tx.sesiones.update({
                where: { id: session.id },
                data: { expira_en: new Date(Date.now() - 1) },
              });
              await request(server)
                .get('/auth/me')
                .set('Cookie', cookie)
                .expect(401);
              await tx.sesiones.update({
                where: { id: session.id },
                data: { expira_en: new Date(Date.now() + 60000) },
              });
              await post('logout').set('Cookie', cookie).send({}).expect(204);
              await request(server)
                .get('/auth/me')
                .set('Cookie', cookie)
                .expect(401);
            } finally {
              await app.close();
            }
            throw rollback;
          },
          { timeout: 30000 },
        ),
      ).rejects.toBe(rollback);
    } finally {
      await owner.close();
    }
  }, 40000);
});
