import { ObjectId } from 'mongodb';

import { User } from '@on/app/user/model/user.model';

export interface IRegister {
  phone: string;
}

export interface IVerifyPhone extends IRegister {
  otp: string;
}

export interface IRegisterResponse {
  userId: ObjectId;
  phone: string;
  otp: string;
}

export interface IVerifyPhoneResponse {
  user: User;
  token: string;
}
