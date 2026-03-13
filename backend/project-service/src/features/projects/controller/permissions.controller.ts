import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  @Get()
  @ApiOperation({ summary: 'Get all permissions (stub)' })
  getAll() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by id (stub)' })
  getOne(@Param('id') id: string) {
    return { id, message: 'Permission stub' };
  }
}