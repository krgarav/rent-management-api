import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDetailDocument = HydratedDocument<UserDetail>;

@Schema({ timestamps: true })
export class UserDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Reference to User (tenant)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Personal / Tenant Info
  @Prop({ trim: true, default: null })
  phone?: string;

  @Prop({ trim: true, default: null })
  emergencyContact?: string;

  @Prop({ trim: true, default: null })
  address?: string;

  @Prop({ trim: true, default: null })
  city?: string;

  @Prop({ trim: true, default: null })
  country?: string;

  @Prop({ trim: true, default: null })
  occupation?: string;

  // Rental / Lease Info
  @Prop({ trim: true, default: null })
  rentalAgreementUrl?: string;

  @Prop({ default: null })
  leaseStartDate?: Date;

  @Prop({ default: null })
  leaseEndDate?: Date;

  @Prop({ default: null })
  securityDepositAmount?: number;

  // Flexible metadata (VERY useful for future scaling)
  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export const UserDetailSchema = SchemaFactory.createForClass(UserDetail);

UserDetailSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const detail = ret as {
      _id?: { toString: () => string };
      id?: string;
    };

    detail.id = detail._id?.toString();
    delete ret._id;

    return ret;
  },
});