import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

const PROJECTS_SERVICE_URL =
  process.env.PROJECTS_SERVICE_URL || 'http://localhost:3002';

@UseGuards(JwtAuthGuard)
@Controller('role-assignments')
export class RoleAssignmentsProxyController {
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
      const axiosConfig: any = {
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: new URL(PROJECTS_SERVICE_URL).host,
        },
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        axiosConfig.data = req.body;
      }

      const response = await axios(axiosConfig);

      res.status(response.status);
      Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key]);
      });
      res.send(response.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status);
        Object.keys(error.response.headers).forEach(key => {
          res.setHeader(key, error.response.headers[key]);
        });
        res.send(error.response.data);
      } else {
        res.status(500).json({ message: 'Proxy error', error: error.message });
      }
    }
  }
}
