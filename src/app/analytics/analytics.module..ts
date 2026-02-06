import { Module } from '@nestjs/common';

import { CreditModule } from '../credit/credit.module';
import { CustomerModule } from '../customer/customer.module';

import { AnalyticController } from './analytics.controller';
import { AnalyticService } from './analytics.service';

@Module({
  imports: [CustomerModule, CreditModule],
  controllers: [AnalyticController],
  providers: [AnalyticService],
  exports: [],
})
export class AnalyticModule {}
