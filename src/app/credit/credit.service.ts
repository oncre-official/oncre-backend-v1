import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { CustomerRepository } from '../customer/repository/customer.repository';
import { User } from '../user/model/user.model';

import { OfferCreditDto } from './dto/offer.dto';
import { QueryCreditDto } from './dto/query.dto';
import { RepaymentDto } from './dto/repay.dto';
import { Credit } from './model/credit.model';
import { Repayment } from './model/repayment.model';
import { CreditRepository } from './repository/credit.repository';
import { RepaymentRepository } from './repository/repayment.repository';
import { CREDIT_STATUS } from './types/credit.interface';

@Injectable()
export class CreditService {
  constructor(
    private readonly credit: CreditRepository,
    private readonly customer: CustomerRepository,
    private readonly repayment: RepaymentRepository,
  ) {}

  async find(query: QueryCreditDto, skip: number, limit: number): Promise<ServiceResponse<any>> {
    const data = await this.credit.findAndCount(query, {
      aggregate: { skip, limit },
      populate: [{ path: 'repayments' }],
      sort: { createdAt: -1 },
    });

    return { data, message: `credits successfully fetched` };
  }

  async offer(user: User, payload: OfferCreditDto): Promise<ServiceResponse<Credit>> {
    const ownerId = user._id;

    const { phone, name } = payload;

    let customer = await this.customer.findOne({ ownerId, phone });
    if (!customer) customer = await this.customer.create({ ownerId, name, phone });

    const creditPayload = {
      ownerId,
      customerId: customer._id,
      ...payload,
    };

    const credit = await this.credit.create(creditPayload);

    return { data: credit, message: `Credit successfully created` };
  }

  /**
   * REPAYMENT
   */
  async repay(id: string, payload: RepaymentDto): Promise<ServiceResponse<Repayment>> {
    const { amount, date } = payload;

    const credit = await this.credit.findById(id);
    if (!credit) throw new NotFoundException('Credit not found');
    if (credit.status === CREDIT_STATUS.PAID) throw new BadRequestException('Credit already paid');

    const balance = credit.totalAmount - credit.amountPaid;

    if (amount <= 0) throw new BadRequestException('Invalid repayment amount');
    if (amount > balance) throw new BadRequestException('Amount exceeds balance');

    const repayment = await this.repayment.create({
      creditId: credit._id,
      amount,
      date: date ?? new Date(),
    });

    const newAmountPaid = credit.amountPaid + amount;

    await this.credit.updateOne(
      { _id: credit._id },
      {
        $set: {
          amountPaid: newAmountPaid,
          status: newAmountPaid >= credit.totalAmount ? CREDIT_STATUS.PAID : CREDIT_STATUS.ACTIVE,
        },
      },
    );

    return { data: repayment, message: `Credit successfully repayed` };
  }
}
