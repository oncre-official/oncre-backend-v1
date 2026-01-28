import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IRegister, IVerifyPhone } from '../types/auth.interface';

export class RegisterDto implements IRegister {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyPhoneDto extends RegisterDto implements IVerifyPhone {
  @ApiProperty({ description: 'User OTP code' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
