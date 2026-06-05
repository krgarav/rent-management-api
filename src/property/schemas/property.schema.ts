import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ timestamps: true })
export class Property {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Owner / landlord
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  // Basic info
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  country?: string;

  // Property details
  @Prop({ default: 0 })
  totalUnits: number;

  @Prop({ default: 0 })
  rentPerUnit: number;

  @Prop({ default: true })
  isActive: boolean;

  // Flexible metadata
  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

PropertySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});
