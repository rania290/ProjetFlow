import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

const CLIENT_PORTAL_SERVICE_URL =
    process.env.CLIENT_PORTAL_SERVICE_URL || 'http://localhost:3003';

@UseGuards(JwtAuthGuard)
@Controller('client-portal')
export class ClientPortalProxyController {
    @All()
    async proxyRoot(@Req() req: Request, @Res() res: Response) {
        return this.proxy(req, res);
    }

    @All('*path')
    async proxy(@Req() req: Request, @Res() res: Response) {
        const originalUrl = req.originalUrl || req.url || '';
        const pathWithoutApi = originalUrl.replace(/^\/api\/client-portal/, '');
        const targetUrl = `${CLIENT_PORTAL_SERVICE_URL}${pathWithoutApi}`;

        try {
            const axiosConfig: any = {
                method: req.method,
                url: targetUrl,
                headers: { ...req.headers },
                validateStatus: () => true,
            };

            // Clean headers
            delete axiosConfig.headers['host'];
            delete axiosConfig.headers['content-length'];

            if (req.method !== 'GET' && req.method !== 'HEAD') {
                axiosConfig.data = req.body;
            }

            const response = await axios(axiosConfig);

            // Propagate headers
            Object.keys(response.headers).forEach(key => {
                res.setHeader(key, response.headers[key] as string);
            });

            return res.status(response.status).send(response.data);
        } catch (error: any) {
            console.error('Client Portal Proxy error:', error);
            return res.status(502).json({
                message: 'Client Portal Service unavailable',
                error: 'Bad Gateway',
                statusCode: 502
            });
        }
    }
}
