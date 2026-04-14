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

    @All('*')
    async proxy(@Req() req: Request, @Res() res: Response) {
        const url = `${this.reportingServiceUrl}${req.url.replace('/reporting', '/reporting')}`;

        try {
            const response = await axios({
                method: req.method,
                url,
                data: req.body,
                params: req.query,
                headers: {
                    ...req.headers,
                    host: new URL(this.reportingServiceUrl).host,
                },
                responseType: req.url.includes('/pdf') ? 'arraybuffer' : 'json',
            });

            res.set(response.headers);
            res.status(response.status).send(response.data);
        } catch (error) {
            if (error.response) {
                res.status(error.response.status).send(error.response.data);
            } else {
                res.status(500).send({ message: 'Error connecting to reporting service', error: error.message });
            }
        }
    }
}
