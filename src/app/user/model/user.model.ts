import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { ROLE, USER_STATUS } from '@on/enum';

import { IUser } from '../types/user.interface';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', versionKey: false, timestamps: true })
export class User extends Document implements IUser {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true })
  phone: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  pin: string;

  @ApiProperty()
  @Prop({ type: String, required: true, default: ROLE.MERCHANT })
  role: ROLE;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  phoneVerified: boolean;

  @ApiProperty()
  @Prop({ enum: USER_STATUS, required: true, default: USER_STATUS.INACTIVE })
  status: USER_STATUS;

  @ApiProperty()
  @Prop({ type: Date })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
