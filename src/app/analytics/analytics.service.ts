import { Injectable } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { CreditRepository } from '../credit/repository/credit.repository';
import { CREDIT_STATUS } from '../credit/types/credit.interface';
import { CustomerRepository } from '../customer/repository/customer.repository';
import { User } from '../user/model/user.model';

@Injectable()
export class AnalyticService {
  constructor(
    private readonly credit: CreditRepository,
    private readonly customer: CustomerRepository,
  ) {}

  // ---------- CREDIT METRICS ----------
  async creditMetric(user: User): Promise<ServiceResponse<any>> {
    const ownerId = user._id;

    const pipeline = [
      { $match: { ownerId } },
      {
        $group: { _id: null, totalCreditGiven: { $sum: '$totalAmount' }, totalPaid: { $sum: '$amountPaid' } },
      },
      {
        $project: {
          _id: 0,
          totalCreditGiven: 1,
          totalPaid: 1,
          outstandingBalance: { $subtract: ['$totalCreditGiven', '$totalPaid'] },
        },
      },
    ];

    const activeCustomersPipeline = [
      { $match: { ownerId, status: CREDIT_STATUS.ACTIVE } },
      { $group: { _id: '$customerId' } },
      { $count: 'totalActiveCustomers' },
    ];

    const [creditMetrics, activeCustomers] = await Promise.all([
      this.credit.aggregate(pipeline) as any,
      this.credit.aggregate(activeCustomersPipeline) as any,
    ]);

    const totalCreditsGiven = creditMetrics[0]?.totalCreditGiven || 0;
    const totalAmountPaid = creditMetrics[0]?.totalPaid || 0;
    const outstandingBalance = creditMetrics[0]?.outstandingBalance || 0;

    const data = {
      totalActiveCreditCustomers: activeCustomers[0]?.totalActiveCustomers || 0,
      totalCreditsGiven,
      totalAmountPaid,
      outstandingBalance,
    };

    return { data, message: 'Credit metrics fetched successfully' };
  }

  // ---------- CUSTOMER BREAKDOWN ----------
  async customerBreakdown(user: User, query: any = {}): Promise<ServiceResponse<any>> {
    const ownerId = user._id;

    const { startDate, endDate } = query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const totalCustomersPipeline = [{ $match: { ownerId } }, { $count: 'count' }];
    const newCustomersPipeline = [{ $match: { ownerId, ...dateFilter } }, { $count: 'count' }];
    const activeCustomersPipeline = [
      { $match: { ownerId, status: CREDIT_STATUS.ACTIVE } },
      { $group: { _id: '$customerId' } },
      { $count: 'count' },
    ];

    const [totalCustomers, newCustomers, activeCustomers] = await Promise.all([
      this.customer.aggregate(totalCustomersPipeline) as any,
      this.customer.aggregate(newCustomersPipeline) as any,
      this.credit.aggregate(activeCustomersPipeline) as any,
    ]);

    const data = {
      totalCustomers: totalCustomers[0]?.count || 0,
      activeCustomers: activeCustomers[0]?.count || 0,
      newCustomers: newCustomers[0]?.count || 0,
    };

    return { data, message: 'Customer breakdown fetched successfully' };
  }
}
