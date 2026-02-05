import { Injectable } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { CreditRepository } from './repository/credit.repository';

@Injectable()
export class CreditService {
  constructor(private readonly credit: CreditRepository) {}

  async find(filter: any): Promise<ServiceResponse<any>> {
    const data = await this.credit.find(filter);

    return { data, message: `credits successfully fetched` };
  }
}
