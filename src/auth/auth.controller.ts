import { Body, Controller, Get, Headers, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  RequestEmailOtpDto,
  VerifyEmailDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    console.log(body);
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  async logout(
    @Headers('authorization') authorization: string,
    @Body() body: LogoutDto,
  ) {
    return this.authService.logout(
      body?.refreshToken,
      this.getBearerToken(authorization),
    );
  }

  @Get('me')
  async me(@Headers('authorization') authorization: string) {
    return this.authService.getProfile(this.getBearerToken(authorization));
  }

  @Post('change-password')
  async changePassword(
    @Headers('authorization') authorization: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      this.getBearerToken(authorization),
      body,
    );
  }

  @Post('request-email-otp')
  async requestEmailOtp(@Body() body: RequestEmailOtpDto) {
    return this.authService.requestEmailOtp(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body);
  }

  private getBearerToken(authorization?: string): string {
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return '';
    }

    return token;
  }
}
