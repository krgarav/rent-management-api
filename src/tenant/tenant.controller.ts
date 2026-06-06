import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // GET /tenants/:id
  @Get('tenants/:id')
  getTenantById(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  // GET /tenants/:tenantId/transactions
  @Get('tenants/:tenantId/transactions')
  getTenantTransactions(@Param('tenantId') tenantId: string) {
    return this.tenantService.getTenantTransactions(tenantId);
  }

  // GET /rent-payments?tenantId=xxx
  @Get('rent-payments')
  getRentPayments(@Query('tenantId') tenantId: string) {
    return this.tenantService.getRentPayments(tenantId);
  }
}