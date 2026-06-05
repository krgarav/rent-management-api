import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { OllamaModule } from './ollama/ollama.module';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';
import { UserDetailModule } from './user-details/user-detail.module';
import { BillModule } from './Bills/bill.module';
import { PropertyModule } from './property/property.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ??
        'mongodb://localhost:27017/rent-management-api',
    ),
    UsersModule,
    UserDetailModule,
    OllamaModule,
    AuthModule,
    BillModule,
    PropertyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
