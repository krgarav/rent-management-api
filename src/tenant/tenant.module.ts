import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}