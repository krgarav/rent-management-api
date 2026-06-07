import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  Tenant = 'tenant',
  Admin = 'admin',
}

@Schema({ timestamps: true })
export class User {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ enum: UserRole, default: UserRole.Tenant })
  role: UserRole;

  @Prop({ required: true, trim: true })
  phone: number;

  @Prop({ default: null, trim: true })
  photoUrl?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: null })
  emailVerifiedAt?: Date;

  @Prop({ default: null })
  emailVerificationOtp?: string;

  @Prop({ default: null })
  emailVerificationOtpExpiresAt?: Date;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    default: null,
    validate: {
      validator: function (this: User, value: string) {
        // if tenant → propertyId must exist and not be empty
        if (this.role === UserRole.Tenant) {
          return value != null && value.trim().length > 0;
        }
        return true;
      },
      message: 'propertyId is required for tenant users',
    },
  })
  propertyId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);