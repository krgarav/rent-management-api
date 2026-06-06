import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { UserRole } from 'src/users/schemas/user.schema';

@Injectable()
export class TenantService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  private toTenant(user: User) {
    return {
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async getTenantById(id: string) {
    const tenant = await this.userModel.findOne({
      _id: id,
      role: UserRole.Tenant,
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.toTenant(tenant);
  }

  // dummy logic (replace with real transaction model later)
  async getTenantTransactions(tenantId: string) {
    const tenant = await this.userModel.findOne({
      _id: tenantId,
      role: UserRole.Tenant,
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return [
      {
        id: 't1',
        amount: 5000,
        status: 'paid',
      },
    ];
  }

  // dummy rent payments (replace with real schema later)
  async getRentPayments(tenantId: string) {
    const tenant = await this.userModel.findOne({
      _id: tenantId,
      role: UserRole.Tenant,
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return [
      {
        id: 'r1',
        tenantId,
        amount: 5000,
        status: 'paid',
        date: new Date(),
      },
    ];
  }
}