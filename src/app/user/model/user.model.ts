import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

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

  /*******BUSINESS DETAILS *********/
  @ApiProperty()
  @Prop({ type: String, required: false })
  businessName: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  businessType: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  address: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'State', required: false })
  stateId: ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Lga', required: false })
  lgaId: ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('state', { ref: 'State', localField: 'stateId', foreignField: '_id', justOne: true });
UserSchema.virtual('lga', { ref: 'Lga', localField: 'lgaId', foreignField: '_id', justOne: true });

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
