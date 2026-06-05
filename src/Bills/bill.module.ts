import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillController } from './bill.controller';
import { BillService } from './bill.service';
import { Bill, BillSchema } from './schemas/bill.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Bill.name,
        schema: BillSchema,
      },
    ]),
  ],
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService], // useful if other modules (like User/Reports) need it
})
export class BillModule {}
