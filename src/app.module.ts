import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { OllamaModule } from './ollama/ollama.module';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';

console.log("dsfdsf",process.env.MONGODB_URI)
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ??
        'mongodb://localhost:27017/rent-management-api',
    ),
    UsersModule,
    OllamaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
