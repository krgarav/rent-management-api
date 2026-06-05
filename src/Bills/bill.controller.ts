import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Get,
  Delete,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  // CREATE BILL
  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.billService.create(dto);
  }

  // GET SINGLE BILL (for edit screen)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  // UPDATE BILL
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billService.update(id, dto);
  }

  // DELETE BILL (optional)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billService.remove(id);
  }
}