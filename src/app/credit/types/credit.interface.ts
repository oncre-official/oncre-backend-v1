import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum CREDIT_STATUS {
  ACTIVE = 'active',
  OVERDUE = 'overdue',
  PAID = 'paid',
}

export interface ICredit extends IBaseType {
  ownerId: ObjectId;
  customerId: ObjectId;
  totalAmount: number;
  amountPaid: number;
  dueDate: Date;
  status: CREDIT_STATUS;
  enableCharges: boolean;
}
