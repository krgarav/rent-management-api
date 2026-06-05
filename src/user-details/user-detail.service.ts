import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDetail, UserDetailDocument } from './schemas/userdetail.schema';

@Injectable()
export class UserDetailService {
  constructor(
    @InjectModel(UserDetail.name)
    private readonly userDetailModel: Model<UserDetailDocument>,
  ) {}

  //  Create or Save details (upsert by userId)
  async saveDetails(userId: string, payload: Partial<UserDetail>) {
    return this.userDetailModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: payload },
      { new: true, upsert: true },
    );
  }

  // Get details by userId
  async getDetails(userId: string) {
    const details = await this.userDetailModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!details) {
      throw new NotFoundException('User details not found');
    }

    return details;
  }

  //  Update details (partial update)
  async updateDetails(userId: string, payload: Partial<UserDetail>) {
    const updated = await this.userDetailModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: payload },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User details not found');
    }

    return updated;
  }

  //  Delete details
  async deleteDetails(userId: string) {
    const deleted = await this.userDetailModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
    });

    if (!deleted) {
      throw new NotFoundException('User details not found');
    }

    return { message: 'User details deleted successfully' };
  }
}