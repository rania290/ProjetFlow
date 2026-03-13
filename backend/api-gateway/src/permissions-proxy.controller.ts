import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

declare const fetch: any;

const PROJECTS_SERVICE_URL =
  process.env.PROJECTS_SERVICE_URL || 'http://localhost:3002';

@Controller('permissions')
export class PermissionsProxyController {
  @All()
  async proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res);
  }

  @All('*path')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const originalUrl = req.originalUrl || req.url || '';
    const pathWithoutApi = originalUrl.replace(/^\/api/, '');
    const targetUrl = `${PROJECTS_SERVICE_URL}${pathWithoutApi}`;

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(([key]) =>
            !['host', 'content-length'].includes(key.toLowerCase())
          )
        ),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      res.status(response.status);

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