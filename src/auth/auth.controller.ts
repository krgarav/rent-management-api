import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
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
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
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
