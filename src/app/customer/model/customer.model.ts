import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { ICustomer } from '../types/customer.interface';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ collection: 'customers', versionKey: false, timestamps: true })
export class Customer extends Document implements ICustomer {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  phone: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
