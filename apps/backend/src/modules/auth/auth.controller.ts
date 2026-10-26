import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

const cookieName = 'falta_uno_session';
function token(req: Request) {
  return (
    (req.headers.cookie ?? '')
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) ?? ''
  );
}
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('register')
  @Header('Cache-Control', 'no-store')
  async register(@Body() body: unknown) {
    return { usuario: await this.auth.register(body) };
  }

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(body);
    res.cookie(cookieName, result.token, {
      ...cookieOptions(),
      expires: result.expires,
    });
    return { usuario: result.usuario };
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async me(@Req() req: Request) {
    return { usuario: await this.auth.me(token(req)) };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(token(req));
    res.clearCookie(cookieName, cookieOptions());
  }
}
