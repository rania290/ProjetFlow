import {
  All,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

const HR_SERVICE_URL =
  process.env.HR_SERVICE_URL || 'http://localhost:3004';

@Controller('hr')
export class HrProxyController {
  @Get('health')
  async health(@Res() res: Response) {
    try {
      console.log(`[HR Proxy] Checking health at ${HR_SERVICE_URL}/api/v1/hr/leaves/hello`);
      const response = await axios.get(`${HR_SERVICE_URL}/api/v1/hr/leaves/hello`, { timeout: 3000 });
      return res.status(200).json({ 
        status: 'ok', 
        gateway: 'connected', 
        hr_service: 'reachable',
        hr_details: response.data 
      });
    } catch (error: any) {
      console.error(`[HR Proxy] Health check failed: ${error.message}`);
      return res.status(503).json({ 
        status: 'error', 
        gateway: 'connected', 
        hr_service: 'unreachable',
        error: error.message 
      });
    }
  }

  @All()
  @UseGuards(JwtAuthGuard)
  async proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res);
  }

  @All('*path')
  @UseGuards(JwtAuthGuard)
  async proxy(@Req() req: Request, @Res() res: Response) {
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    const user = (req as any).user;
    const originalUrl = req.originalUrl || req.url || '';
    
    // /api/hr/leaves -> /hr/leaves
    const pathWithoutApi = originalUrl.replace(/^\/api\/hr/, '/hr');
    const targetUrl = `${HR_SERVICE_URL}/api/v1${pathWithoutApi}`;

    console.log(`[HR Proxy] ${req.method} ${originalUrl} -> ${targetUrl}`);

    const method = req.method;
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

    // Inject identity headers that HR microservice expects
    if (user) {
      headers['x-user-id'] = String(user.id || user.sub || '');
      const originalRole = user.role || user.roles || '';
      // Every authenticated user is an EMPLOYEE by default in the HR service
      let mappedRoles = ['EMPLOYEE'];
      if (originalRole === 'SUPER_ADMIN' || originalRole === 'ADMIN' || originalRole === 'HR_ADMIN') {
        mappedRoles.push('HR_ADMIN');
      } else if (originalRole === 'PROJECT_MANAGER' || originalRole === 'MANAGER') {
        mappedRoles.push('MANAGER');
      }
      headers['x-user-roles'] = mappedRoles.join(',');
    }

    // CRITICAL: Strip the Authorization (JWT) header before sending to downstream service
    // because the hr-service uses it as a plain UserID if present, causing DB errors.
    delete headers['authorization'];

    try {
      const axiosConfig: any = {
        method: method,
        url: targetUrl,
        headers: headers,
        validateStatus: () => true,
      };

      if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        axiosConfig.data = req.body;
      }

      const response = await axios(axiosConfig);

      // Return JSON directly to avoid technical header conflicts that cause crashes
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error('HR Proxy error:', error.message);
      return res.status(502).json({ 
        message: 'HR Service unavailable', 
        error: 'Bad Gateway', 
        statusCode: 502,
        debug_url: targetUrl 
      });
    }
  }
}
