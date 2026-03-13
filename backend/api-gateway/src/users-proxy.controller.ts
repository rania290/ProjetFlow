import {
  All,
  Controller,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

// Typage minimal pour fetch afin d'éviter les erreurs TS
declare const fetch: any;

const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL || 'http://localhost:3001'; // auth-service also hosts users

@Controller('users')
export class UsersProxyController {
  @All()
  async proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res);
  }

  @All('*path')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const originalUrl = req.originalUrl || req.url || '';
    // /api/users/... or /api/users -> /users/... or /users
    const pathWithoutApi = originalUrl.replace(/^\/api/, '');
    const targetUrl = `${USERS_SERVICE_URL}${pathWithoutApi}`;

    const method = req.method;

    // Copie des headers utiles
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (
        value === undefined ||
        ['host', 'content-length'].includes(key.toLowerCase())
      ) {
        continue;
      }
      headers[key] = Array.isArray(value) ? value.join(',') : String(value);
    }

    // Corps de la requête (JSON)
    let body: any = undefined;
    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
      body = req.body ? JSON.stringify(req.body) : undefined;
      headers['content-type'] = headers['content-type'] || 'application/json';
    }

    try {
      const response = await fetch(targetUrl, {
        method,
        headers,
        body,
      });

      // Statut
      res.status(response.status);

      // Propager les cookies (Set-Cookie)
      const setCookie = response.headers.raw
        ? response.headers.raw()['set-cookie']
        : response.headers.get('set-cookie')
        ? [response.headers.get('set-cookie')]
        : [];

      if (setCookie && Array.isArray(setCookie)) {
        for (const cookie of setCookie) {
          if (cookie) {
            res.append('Set-Cookie', cookie);
          }
        }
      }

      // Propager le content-type
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.send(json);
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(502).json({ message: 'Service unavailable', error: 'Bad Gateway', statusCode: 502 });
    }
  }
}
