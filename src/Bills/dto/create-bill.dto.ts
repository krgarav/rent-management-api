import {
  IsMongoId,
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
}

class ElectricUsageDto {
  @IsNumber()
  previousUnit: number;

  @IsNumber()
  currentUnit: number;
}

class ElectricBillDto {
  @ValidateNested()
  @Type(() => ElectricUsageDto)
  usage: ElectricUsageDto;

  @IsOptional()
  @IsString()
  billPhotoUrl?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

class RentDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

export class CreateBillDto {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsString()
  month?: string;

  @ValidateNested()
  @Type(() => ElectricBillDto)
  electricBill: ElectricBillDto;

  @ValidateNested()
  @Type(() => RentDto)
  rent: RentDto;

  @IsOptional()
  meta?: Record<string, any>;
}
