import { UserRole } from '../../users/schemas/user.schema';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  photoUrl?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RequestEmailOtpDto {
  email: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}
