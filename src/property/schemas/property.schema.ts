import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ timestamps: true })
export class Property {
  createdAt: Date;
  updatedAt: Date;

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


