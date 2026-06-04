import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<StoredUser, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllUsers(): Promise<PublicUser[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 }).exec();

    return users.map((user) => this.toPublicUser(user));
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    photoUrl?: string;
  }): Promise<PublicUser> {
    const user = await this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role ?? UserRole.Tenant,
      photoUrl: data.photoUrl,
      passwordHash: data.passwordHash,
    });

    return this.toPublicUser(user);
  }

  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .exec();

    return user ? this.toStoredUser(user) : undefined;
  }

  async findById(id: string): Promise<StoredUser | undefined> {
    const user = await this.userModel.findById(id).exec();

    return user ? this.toStoredUser(user) : undefined;
  }

  async updatePassword(id: string, passwordHash: string): Promise<PublicUser> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { passwordHash },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  toPublicUser(user: UserDocument | StoredUser): PublicUser {
    const storedUser = this.toStoredUser(user);

    return {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
      photoUrl: storedUser.photoUrl,
      createdAt: storedUser.createdAt,
      updatedAt: storedUser.updatedAt,
    };
  }

  private toStoredUser(user: UserDocument | StoredUser): StoredUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
