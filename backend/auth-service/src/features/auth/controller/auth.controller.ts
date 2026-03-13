import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiSecurity } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { CookieService } from '../security/cookie.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants/auth.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive cookies' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.cookieService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      message: 'Login successful',
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear cookies' })
  async logout(@Res({ passthrough: true }) res: Response) {
    this.cookieService.clearAuthCookies(res);
    return { message: 'Logout successful' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate access token using refresh token cookie' })
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    const result = await this.authService.refresh(refreshToken);
    this.cookieService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      message: 'Tokens rotated successfully',
      user: result.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('access_token')
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    security: [{ access_token: [] }],
  })
  async me(@Req() req: any) {
    return req.user;
  }
}

