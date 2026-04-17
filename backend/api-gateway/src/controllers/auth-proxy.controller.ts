import {
  All,
  Controller,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

@Controller('auth')
export class AuthProxyController {
  private readonly logger = new Logger(AuthProxyController.name);

  @All('*path')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const originalUrl = req.originalUrl || req.url || '';
    const pathWithoutApi = originalUrl.replace(/^\/api/, '');
    const targetUrl = `${AUTH_SERVICE_URL}${pathWithoutApi}`;

    try {
      this.logger.log(`Proxying ${req.method} ${originalUrl} to ${targetUrl}`);

      const axiosConfig: any = {
        method: req.method,
        url: targetUrl,
        headers: { ...req.headers },
        validateStatus: () => true, // Allow all statuses to be passed through
      };

      // Remove headers that should not be forwarded
      delete axiosConfig.headers['host'];
      delete axiosConfig.headers['content-length'];

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        axiosConfig.data = req.body;
      }

      const response = await axios(axiosConfig);

      // Propagate headers (excluding CORS headers handled by the Gateway)
      Object.keys(response.headers).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.startsWith('access-control-')) {
          return;
        }
        res.setHeader(key, response.headers[key] as string);
      });

      return res.status(response.status).send(response.data);
    } catch (error: any) {
      this.logger.error(`Failed to proxy to ${targetUrl}: ${error.message}`);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'Service d\'authentification indisponible.',
          error: 'AUTH_SERVICE_UNAVAILABLE'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}
