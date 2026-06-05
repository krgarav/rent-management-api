import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
  ) {}

  // CREATE
  async create(dto: CreatePropertyDto): Promise<Property> {
    const created = new this.propertyModel({
      ...dto,
    });

    return created.save();
  }

  // GET ALL
  async findAll(): Promise<Property[]> {
    return this.propertyModel.find();
  }

  // GET ONE
  async findOne(id: string): Promise<Property> {
    const property = await this.propertyModel.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  // UPDATE
  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.propertyModel.findById(id);
    if (!property) throw new NotFoundException('Property not found');

    Object.assign(property, dto);
    return property.save();
  }

  // DELETE
  async remove(id: string): Promise<void> {
    const res = await this.propertyModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Property not found');
  }
}
