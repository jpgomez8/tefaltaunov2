import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';

export function configureHttp(app: INestApplication) {
  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.getOrThrow<string[]>('FRONTEND_ORIGINS'),
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Falta-Uno'],
  });
  // El encabezado obliga a un preflight; el origen también se valida antes de modificar datos.
  const attempts = new Map<string, { count: number; until: number }>();
  let active = 0;
  app.use('/auth', (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return next();
    const origin = req.headers.origin;
    if (
      req.headers['x-falta-uno'] !== '1' ||
      (origin &&
        !config.getOrThrow<string[]>('FRONTEND_ORIGINS').includes(origin))
    ) {
      return res
        .status(403)
        .json({ message: 'Origen de la solicitud no permitido.' });
    }
    if (req.path === '/logout') return next();
    const now = Date.now();
    for (const [key, value] of attempts)
      if (value.until <= now) attempts.delete(key);
    const key = req.ip ?? 'unknown';
    const attempt = attempts.get(key) ?? {
      count: 0,
      until: now + 15 * 60 * 1000,
    };
    if (attempt.count >= 20 || active >= 4 || attempts.size >= 10000) {
      res.setHeader('Retry-After', '900');
      return res
        .status(429)
        .json({ message: 'Demasiados intentos. Espera unos minutos.' });
    }
    attempt.count++;
    attempts.set(key, attempt);
    active++;
    res.once('close', () => {
      active--;
    });
    return next();
  });
}
