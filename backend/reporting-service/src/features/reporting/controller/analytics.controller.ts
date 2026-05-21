import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../service/analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('global')
    @ApiOperation({ summary: 'Get global analytics data from projects and tasks' })
    async getGlobalAnalytics(
        @Headers('x-user-id') userId?: string,
        @Headers('x-user-role') role?: string,
        @Headers('authorization') authHeader?: string
    ) {
        return this.analyticsService.getGlobalAnalytics(userId, role, authHeader);
    }
}
