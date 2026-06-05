import { IsMongoId,IsOptional, IsString, IsNumber, IsDateString, IsObject } from 'class-validator';

export class CreateUserDetailDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  rentalAgreementUrl?: string;

  @IsOptional()
  @IsDateString()
  leaseStartDate?: Date;

  @IsOptional()
  @IsDateString()
  leaseEndDate?: Date;

  @IsOptional()
  @IsNumber()
  securityDepositAmount?: number;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}



export class UpdateUserDetailDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  rentalAgreementUrl?: string;

  @IsOptional()
  @IsDateString()
  leaseStartDate?: Date;

  @IsOptional()
  @IsDateString()
  leaseEndDate?: Date;

  @IsOptional()
  @IsNumber()
  securityDepositAmount?: number;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}


export class UserIdParamDto {
  @IsMongoId()
  userId: string;
}