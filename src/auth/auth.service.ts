import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { UserRole } from '../users/schemas/user.schema';
import { PublicUser, UsersService } from '../users/users.service';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RequestEmailOtpDto,
  VerifyEmailDto,
} from './dto/auth.dto';

const scrypt = promisify(scryptCallback);

interface Session {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}

interface AccessTokenSession {
  userId: string;
  expiresAt: Date;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, Session>();
  private readonly accessTokens = new Map<string, AccessTokenSession>();
  private readonly accessTokenTtlSeconds = 60 * 60;
  private readonly refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000;
  private readonly emailOtpTtlMs = 10 * 60 * 1000;

  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.validateRegisterInput(registerDto);

    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await this.hashPassword(registerDto.password);
    const user = await this.usersService.createUser({
      name: registerDto.name.trim(),
      email: registerDto.email,
      role: registerDto.role,
      phone: registerDto.phone,
      
      photoUrl: registerDto.photoUrl?.trim(),
      passwordHash,
      propertyId : registerDto.propertyId,
    });
    const tokens = this.createSession(user._id);

    return { user, ...tokens };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.validateEmail(loginDto.email);

    const user = await this.usersService.findByEmail(loginDto.email);

    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.createSession(user._id);

    return { user: this.usersService.toPublicUser(user), ...tokens };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const session = this.getValidSession(refreshTokenDto.refreshToken);
    this.sessions.delete(refreshTokenDto.refreshToken);

    const user = await this.usersService.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.createSession(user._id);

    return { user: this.usersService.toPublicUser(user), ...tokens };
  }

  async logout(
    refreshToken?: string,
    accessToken?: string,
  ): Promise<{ success: boolean }> {
    if (refreshToken) {
      this.sessions.delete(refreshToken);
    }

    if (accessToken) {
      this.accessTokens.delete(accessToken);
    }

    return { success: true };
  }

  async getProfile(accessToken: string): Promise<PublicUser> {
    const session = this.getValidAccessTokenSession(accessToken);

    const user = await this.usersService.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    return this.usersService.toPublicUser(user);
  }

  async changePassword(
    accessToken: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; user: PublicUser }> {
    const session = this.getValidAccessTokenSession(accessToken);

    const user = await this.usersService.findById(session.userId);

    if (
      !user ||
      !(await this.verifyPassword(
        changePasswordDto.currentPassword,
        user.passwordHash,
      ))
    ) {
      throw new UnauthorizedException('Invalid current password');
    }

    this.validatePassword(changePasswordDto.newPassword);

    const passwordHash = await this.hashPassword(changePasswordDto.newPassword);
    const updatedUser = await this.usersService.updatePassword(
      user._id,
      passwordHash,
    );

    return { success: true, user: updatedUser };
  }

  async requestEmailOtp(
    requestEmailOtpDto: RequestEmailOtpDto,
  ): Promise<{ success: boolean; message: string; otp: string }> {
    this.validateEmail(requestEmailOtpDto.email);

    const user = await this.usersService.findByEmail(requestEmailOtpDto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.emailOtpTtlMs);

    await this.usersService.setEmailVerificationOtp(
      requestEmailOtpDto.email,
      otp,
      expiresAt,
    );

    return {
      success: true,
      message: 'Email verification OTP generated',
      otp,
    };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ success: boolean; user: PublicUser }> {
    this.validateEmail(verifyEmailDto.email);

    const user = await this.usersService.findByEmail(verifyEmailDto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        user: this.usersService.toPublicUser(user),
      };
    }

    if (
      !user.emailVerificationOtp ||
      user.emailVerificationOtp !== verifyEmailDto.otp
    ) {
      throw new BadRequestException('Invalid OTP');
    }

    if (
      !user.emailVerificationOtpExpiresAt ||
      user.emailVerificationOtpExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('OTP has expired');
    }

    const verifiedUser = await this.usersService.verifyEmail(user._id);

    return {
      success: true,
      user: verifiedUser,
    };
  }

  private createSession(userId: string): AuthTokens {
    const accessToken = randomBytes(32).toString('hex');
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlMs);
    const accessTokenExpiresAt = new Date(
      Date.now() + this.accessTokenTtlSeconds * 1000,
    );

    this.accessTokens.set(accessToken, {
      userId,
      expiresAt: accessTokenExpiresAt,
    });
    this.sessions.set(refreshToken, { userId, refreshToken, expiresAt });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtlSeconds,
    };
  }

  private getValidSession(refreshToken: string): Session {
    const session = this.sessions.get(refreshToken);

    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (refreshToken) {
        this.sessions.delete(refreshToken);
      }

      throw new UnauthorizedException('Invalid refresh token');
    }

    return session;
  }

  private getValidAccessTokenSession(accessToken: string): AccessTokenSession {
    const session = this.accessTokens.get(accessToken);

    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (accessToken) {
        this.accessTokens.delete(accessToken);
      }

      throw new UnauthorizedException('Invalid access token');
    }

    return session;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${hash.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [salt, storedHash] = storedPassword.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      storedHashBuffer.length === hash.length &&
      timingSafeEqual(storedHashBuffer, hash)
    );
  }

  private validateRegisterInput(registerDto: RegisterDto): void {
    if (!registerDto.name?.trim()) {
      throw new BadRequestException('Name is required');
    }

    this.validateEmail(registerDto.email);
    this.validatePassword(registerDto.password);
    this.validateRole(registerDto.role);
  }

  private validateEmail(email: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Valid email is required');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }

  private validateRole(role?: UserRole): void {
    if (role && !Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Role must be tenant or admin');
    }
  }

  private generateOtp(): string {
    return randomBytes(4).readUInt32BE(0).toString().slice(0, 6).padStart(6, '0');
  }
}
