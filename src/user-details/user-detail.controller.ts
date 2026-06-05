import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UpdateUserDetailDto,CreateUserDetailDto } from './dto/userdetails.dto';

@Controller('user-details')
export class UserDetailController {
  constructor(private readonly userDetailService: UserDetailService) {}

  @Post(':userId')
  saveDetails(
    @Param('userId') userId: string,
    @Body() body: CreateUserDetailDto,
  ) {
    return this.userDetailService.saveDetails(userId, body);
  }

  @Get(':userId')
  getDetails(@Param('userId') userId: string) {
    return this.userDetailService.getDetails(userId);
  }

  @Patch(':userId')
  updateDetails(
    @Param('userId') userId: string,
    @Body() body: UpdateUserDetailDto,
  ) {
    return this.userDetailService.updateDetails(userId, body);
  }

  @Delete(':userId')
  deleteDetails(@Param('userId') userId: string) {
    return this.userDetailService.deleteDetails(userId);
  }
}