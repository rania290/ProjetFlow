import {
  All,
  Controller,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL || 'http://localhost:3001'; // auth-service also hosts users

@UseGuards(JwtAuthGuard)
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
      const axiosConfig: any = {
        method: req.method,
        url: targetUrl,
        headers: { ...req.headers },
        validateStatus: () => true,
      };

      delete axiosConfig.headers['host'];
      delete axiosConfig.headers['content-length'];

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        axiosConfig.data = req.body;
      }

      const response = await axios(axiosConfig);

      Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key] as string);
      });

      return res.status(response.status).send(response.data);
    } catch (error: any) {
      console.error('Proxy error:', error);
      return res.status(502).json({ message: 'Service unavailable', error: 'Bad Gateway', statusCode: 502 });
    }
  }
}
