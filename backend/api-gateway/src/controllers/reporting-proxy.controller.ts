import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('reporting')
@UseGuards(JwtAuthGuard)
export class ReportingProxyController {
    private readonly reportingServiceUrl: string;

    constructor(private configService: ConfigService) {
        this.reportingServiceUrl = this.configService.get('REPORTING_SERVICE_URL') || 'http://localhost:3005';
    }

    @All()
    async proxyRoot(@Req() req: Request, @Res() res: Response) {
        return this.proxy(req, res);
    }

    @All('*path')
    async proxy(@Req() req: Request, @Res() res: Response) {
        const originalUrl = (req as any).originalUrl || req.url || '';
        // Strip /api/reporting to map accurately to reporting-service endpoints
        const pathWithoutProxyBase = originalUrl.replace(/^\/api\/reporting/, '');
        const url = `${this.reportingServiceUrl}${pathWithoutProxyBase}`;

        // Prepare headers (filtered)
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
            const lowerKey = key.toLowerCase();
            if (
                value === undefined ||
                ['host', 'content-length', 'connection', 'keep-alive'].includes(lowerKey)
            ) {
                continue;
            }
            headers[key] = Array.isArray(value) ? value.join(',') : String(value);
        }

        try {
            const response = await axios({
                method: req.method,
                url,
                data: req.body,
                params: req.query,
                headers,
                responseType: req.url.includes('/pdf') ? 'arraybuffer' : 'json',
                validateStatus: () => true,
            });

            // Propagate response headers (excluding CORS headers handled by the Gateway)
            Object.keys(response.headers).forEach(key => {
                const lowerKey = key.toLowerCase();
                if (lowerKey.startsWith('access-control-')) {
                    return;
                }
                res.setHeader(key, response.headers[key] as string);
            });

            return res.status(response.status).send(response.data);
        } catch (error) {
            console.error('Reporting Proxy Error:', error.message);
            res.status(502).send({ message: 'Error connecting to reporting service', error: error.message });
        }
    }
}
