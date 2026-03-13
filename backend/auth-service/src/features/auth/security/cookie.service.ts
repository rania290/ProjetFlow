import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_EXPIRES_MS,
  REFRESH_TOKEN_EXPIRES_MS,
} from '../constants/auth.constants';

@Injectable()
export class CookieService {
  private readonly isProd = process.env.NODE_ENV === 'production';

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isSecure = this.isProd;
    const sameSite: 'lax' = this.isProd ? 'lax' : 'lax';

    const commonOpts = {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      path: '/',
    };

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      ...commonOpts,
      maxAge: ACCESS_TOKEN_EXPIRES_MS,
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...commonOpts,
      maxAge: REFRESH_TOKEN_EXPIRES_MS,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  }
}

