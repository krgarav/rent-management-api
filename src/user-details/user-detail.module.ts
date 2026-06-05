
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDetailController } from './user-detail.controller';
import { UserDetailService } from './user-detail.service';
import { UserDetail, UserDetailSchema} from './schemas/userdetail.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserDetail.name,
        schema: UserDetailSchema,
      },
    ]),
  ],
  controllers: [UserDetailController],
  providers: [UserDetailService],
  exports: [UserDetailService], // optional but useful if used elsewhere
})
export class UserDetailModule {}