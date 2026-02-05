import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export interface ICustomer extends IBaseType {
  ownerId: ObjectId;
  phone: string;
  name: string;
}
