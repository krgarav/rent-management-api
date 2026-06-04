import { Controller, Get, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor() {}

  @Get('all-users')
  async getAllUsers() {}

   @Post('')
  async getQueryResult() {
    
  }
}
