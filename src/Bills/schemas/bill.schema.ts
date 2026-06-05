import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BillDocument = HydratedDocument<Bill>;

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
}

@Schema({ _id: false })
class ElectricUsage {
  @Prop({ required: true })
  previousUnit: number;

  @Prop({ required: true })
  currentUnit: number;

  @Prop()
  consumedUnit?: number; // can also be auto-calculated
}

@Schema({ _id: false })
class ElectricBill {
  @Prop({ type: ElectricUsage, required: true })
  usage: ElectricUsage;

  @Prop({ default: null })
  billPhotoUrl?: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ default: 0 })
  amount: number;
}

@Schema({ _id: false })
class Rent {
  @Prop({ default: 0 })
  amount: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;
}

@Schema({ timestamps: true })
export class Bill {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Reference to User (tenant)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // Billing period (optional but useful)
  @Prop()
  month?: string; // e.g. "2026-01"

  // Electricity bill
  @Prop({ type: ElectricBill, required: true })
  electricBill: ElectricBill;

  // Rent details
  @Prop({ type: Rent, required: true })
  rent: Rent;

  // Flexible metadata
  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export const BillSchema = SchemaFactory.createForClass(Bill);

/**
 * Auto-calculate consumed units before saving
 */
BillSchema.pre('save', function (next) {
  if (this.electricBill?.usage) {
    const { previousUnit, currentUnit } = this.electricBill.usage;
    this.electricBill.usage.consumedUnit = currentUnit - previousUnit;
  }
  next();
});

BillSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});