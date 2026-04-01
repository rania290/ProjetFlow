import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportingService } from '../service/reporting.service';
import { ReportingParamsDto } from '../dto/reporting-params.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('reporting')
@Controller('reporting')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('statistics/invoices')
    @ApiOperation({ summary: 'Get invoice statistics' })
    async getInvoiceStatistics(@Query() params: ReportingParamsDto) {
        return this.reportingService.getInvoiceStatistics(params);
    }

    @Get('statistics/tickets')
    @ApiOperation({ summary: 'Get ticket statistics' })
    async getTicketStatistics(@Query() params: ReportingParamsDto) {
        return this.reportingService.getTicketStatistics(params);
    }

    @Get('invoice/:id/pdf')
    @ApiOperation({ summary: 'Generate invoice PDF' })
    async generateInvoicePdf(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const buffer = await this.reportingService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('ticket/:id/pdf')
    @ApiOperation({ summary: 'Generate ticket PDF' })
    async generateTicketPdf(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const buffer = await this.reportingService.generateTicketPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
