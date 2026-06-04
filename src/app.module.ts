import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { OllamaModule } from './ollama/ollama.module';

@Module({
  imports: [UsersModule, OllamaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
