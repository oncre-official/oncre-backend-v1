import { ObjectId } from 'mongodb';

import { ROLE, USER_STATUS } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IUser extends IBaseType {
  phone: string;
  pin: string;
  phoneVerified: boolean;
  role: ROLE;
  status: USER_STATUS;
  lastLogin: Date;

  /*******BUSINESS DETAILS *********/
  businessName: string;
  businessType: string;
  address: string;
  stateId: ObjectId;
  lgaId: ObjectId;
}
