import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaService } from './media.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, MediaService],
  exports: [UsersService],
})
export class UsersModule {}
