import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bill, BillDocument } from './schemas/bill.schema';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Injectable()
export class BillService {
  constructor(
    @InjectModel(Bill.name) private billModel: Model<BillDocument>,
  ) {}

  // CREATE
  async create(dto: CreateBillDto): Promise<Bill> {
    const created = new this.billModel({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
    });

    return created.save();
  }

  // GET ONE (useful for edit screen)
  async findOne(id: string): Promise<Bill> {
    const bill = await this.billModel.findById(id);
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  // UPDATE / EDIT ENTRY
  async update(id: string, dto: UpdateBillDto): Promise<Bill> {
    const bill = await this.billModel.findById(id);

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    // merge update
    Object.assign(bill, dto);

    return bill.save();
  }

  // OPTIONAL: delete
  async remove(id: string): Promise<void> {
    const res = await this.billModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Bill not found');
  }
}