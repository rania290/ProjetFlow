import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../service/analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('global')
    @ApiOperation({ summary: 'Get global analytics data from projects and tasks' })
    async getGlobalAnalytics() {
        return this.analyticsService.getGlobalAnalytics();
    }
}
