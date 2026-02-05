import { Injectable } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { CustomerRepository } from './repository/customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly customer: CustomerRepository) {}

  async find(filter: any): Promise<ServiceResponse<any>> {
    const data = await this.customer.find(filter);

    return { data, message: `customers successfully fetched` };
  }
}
