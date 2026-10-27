import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { hashPassword, verifyPassword } from './password.js';

const publicUser = {
  id: true,
  nombre_publico: true,
  correo: true,
  estado: true,
} as const;
export const sessionHash = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export function credentials(body: unknown, register = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new BadRequestException('Datos inválidos.');
  const data = body as Record<string, unknown>;
  const allowed = register
    ? ['correo', 'password', 'nombre_publico', 'mayoria_edad']
    : ['correo', 'password'];
  if (Object.keys(data).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Campos no permitidos.');
  const correo =
    typeof data.correo === 'string' ? data.correo.trim().toLowerCase() : '';
  if (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    throw new BadRequestException('Ingresa un correo válido.');
  if (
    typeof data.password !== 'string' ||
    data.password.length < (register ? 15 : 1) ||
    data.password.length > 128
  ) {
    throw new BadRequestException(
      'La contraseña debe tener entre 15 y 128 caracteres.',
    );
  }
  const nombre =
    typeof data.nombre_publico === 'string' ? data.nombre_publico.trim() : '';
  if (
    register &&
    (nombre.length < 2 || nombre.length > 100 || data.mayoria_edad !== true)
  ) {
    throw new BadRequestException(
      'Ingresa tu nombre y confirma que tienes 18 años o más.',
    );
  }
  return { correo, password: data.password, nombre };
}

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async register(body: unknown) {
    const data = credentials(body, true);
    const password_hash = await hashPassword(data.password);
    try {
      return await this.db.usuarios.create({
        data: {
          nombre_publico: data.nombre,
          correo: data.correo,
          password_hash,
          mayoria_edad_confirmada_en: new Date(),
        },
        select: publicUser,
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002')
        throw new ConflictException(
          'No se pudo registrar ese correo. Intenta iniciar sesión.',
        );
      throw error;
    }
  }

  async login(body: unknown) {
    const data = credentials(body);
    const user = await this.db.usuarios.findUnique({
      where: { correo: data.correo },
    });
    const valid = await verifyPassword(
      data.password,
      user?.password_hash ?? null,
    );
    if (
      !valid ||
      !user ||
      !['activo', 'pendiente_verificacion'].includes(user.estado)
    ) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const usuario = await this.db.$transaction(async (tx) => {
      await tx.sesiones.create({
        data: {
          usuario_id: user.id,
          token_renovacion_hash: sessionHash(token),
          expira_en: expires,
        },
      });
      return tx.usuarios.update({
        where: { id: user.id },
        data: { ultimo_acceso_en: new Date() },
        select: publicUser,
      });
    });
    return { token, expires, usuario };
  }

  async me(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException('Inicia sesión para continuar.');
    const session = await this.db.sesiones.findUnique({
      where: { token_renovacion_hash: sessionHash(token) },
      include: { usuarios: { select: publicUser } },
    });
    if (
      !session ||
      session.revocada_en ||
      session.expira_en <= new Date() ||
      !['activo', 'pendiente_verificacion'].includes(session.usuarios.estado)
    ) {
      throw new UnauthorizedException('Tu sesión terminó. Vuelve a ingresar.');
    }
    return session.usuarios;
  }

  async logout(token: string) {
    if (/^[a-f0-9]{64}$/.test(token))
      await this.db.sesiones.updateMany({
        where: { token_renovacion_hash: sessionHash(token), revocada_en: null },
        data: { revocada_en: new Date() },
      });
  }
}
