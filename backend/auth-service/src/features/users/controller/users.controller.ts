import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { RolesGuard } from '../../auth/security/roles.guard';
import { Roles } from '../../auth/security/roles.decorator';
import { UserRole } from '../constants/users.constants';
import { UsersService } from '../service/users.service';
import { User } from '../model/users.model';

@ApiTags('users')
@ApiSecurity('access_token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_MEMBER, UserRole.DEVELOPER, UserRole.DESIGNER, UserRole.TESTER)
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_MEMBER, UserRole.DEVELOPER, UserRole.DESIGNER, UserRole.TESTER)
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a user' })
  create(@Body() body: Partial<User>) {
    return this.usersService.create({
      email: body.email ?? '',
      password: body.password ?? 'password123',
      fullName: body.fullName ?? '',
      role: body.role,
    });
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Request() req: any, @Body() body: Partial<User>) {
    const userId = req.user.id;
    // Prevent self-role-change or password change here if desired
    // For now, we allow general updates as per frontend needs
    delete body.role; // Security: don't let user change their own role
    if (body.password) {
      // In a real app, handle password change via separate logic with bcrypt
      delete body.password;
    }
    return this.usersService.update(userId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id') id: string, @Body() body: Partial<User>) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
