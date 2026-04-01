import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('system')
@Controller()
export class AppController {
  @Get()
  @Redirect('/api', 301)
  getRoot() {
    return { message: 'Redirecting to API documentation' };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'VAERDIA API Gateway',
      version: '1.0.0',
    };
  }
}

