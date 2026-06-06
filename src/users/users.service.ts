import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  emailVerificationOtp?: string;
  emailVerificationOtpExpiresAt?: Date;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<
  StoredUser,
  'passwordHash' | 'emailVerificationOtp' | 'emailVerificationOtpExpiresAt'
>;

type UserId = string | Types.ObjectId;

type PublicUserSource = Pick<User, 'name' | 'email' | 'role'> &
  Partial<
    Pick<
      User,
      | 'photoUrl'
      | 'isEmailVerified'
      | 'emailVerifiedAt'
      | 'createdAt'
      | 'updatedAt'
    >
  > & {
    _id: UserId;
  };

type StoredUserSource = PublicUserSource &
  Pick<User, 'passwordHash'> &
  Partial<
    Pick<
      User,
      'emailVerificationOtp' | 'emailVerificationOtpExpiresAt'
    >
  >;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllTenants(): Promise<PublicUser[]> {
    const users = await this.userModel
      .find({ role: UserRole.Tenant })
      .select('_id name email role photoUrl isEmailVerified emailVerifiedAt createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return users.map((user) => this.toPublicUser(user));
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone :number,
    role?: UserRole;
    photoUrl?: string;
  }): Promise<PublicUser> {
    const user = await this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone :data.phone,
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

  async setEmailVerificationOtp(
    email: string,
    otp: string,
    expiresAt: Date,
  ): Promise<PublicUser> {
    const user = await this.userModel
      .findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          emailVerificationOtp: otp,
          emailVerificationOtpExpiresAt: expiresAt,
        },
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

  async verifyEmail(id: string): Promise<PublicUser> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationOtp: null,
          emailVerificationOtpExpiresAt: null,
        },
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

  toPublicUser(user: PublicUserSource): PublicUser {
    return {
      _id: this.toStringId(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
      isEmailVerified: user.isEmailVerified ?? false,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toStoredUser(user: StoredUserSource): StoredUser {
    return {
      _id: this.toStringId(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      emailVerificationOtp: user.emailVerificationOtp,
      emailVerificationOtpExpiresAt: user.emailVerificationOtpExpiresAt,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toStringId(id: UserId): string {
    return id.toString();
  }

  async getUserById(id) {
    return this.userModel.findById(id);
  }
}
