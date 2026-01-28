import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TOKEN_TYPE, USER_STATUS } from '@on/enum';
import { getRandomNumber } from '@on/helpers';
import { ServiceResponse } from '@on/utils/types';

import { TokenRepository } from '../user/repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';
import { IToken } from '../user/types/token.interface';

import { RegisterDto, VerifyPhoneDto } from './dto/auth.dto';
import { IRegisterResponse, IVerifyPhoneResponse } from './types/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserRepository,
    private readonly token: TokenRepository,
  ) {}

  /**
   * STEP -1
   */

  public async register(payload: RegisterDto): Promise<ServiceResponse<IRegisterResponse>> {
    const { phone } = payload;

    const userExists = await this.user.findOne({ phone });
    if (userExists) throw new ConflictException('User with this phone number already exists.');

    const otpCode = getRandomNumber();

    const user = await this.user.create({ phone });

    const tokenPayload: IToken = {
      userId: user._id,
      token: String(otpCode),
      type: TOKEN_TYPE.PHONE_VERIFICATION,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };

    await this.token.create(tokenPayload);

    //TODO SEND SMS INSTEAD OF RETURNING OTP IN RESPONSE

    const data: IRegisterResponse = {
      phone,
      userId: user._id,
      otp: String(otpCode),
    };

    return { data, message: 'User registered successfully. OTP sent for verification.' };
  }

  public async verify(payload: VerifyPhoneDto): Promise<ServiceResponse<IVerifyPhoneResponse>> {
    const { phone, otp } = payload;

    const user = await this.user.findOne({ phone });
    if (!user) throw new NotFoundException('User with this phone number does not exist.');
    if (user.phoneVerified) throw new BadRequestException('Phone number is already verified.');

    const token = await this.token.findOne({ type: TOKEN_TYPE.PHONE_VERIFICATION, token: otp });
    if (!token) throw new BadRequestException('Invalid OTP code.');

    if (token.userId.toString() !== user._id.toString()) throw new BadRequestException('Invalid user OTP.');
    if (token.expiresAt < new Date()) throw new BadRequestException('OTP has expired. Please request a new one.');

    const updated = await this.user.updateById(user._id, { phoneVerified: true, status: USER_STATUS.ACTIVE });
    await token.deleteOne();

    const jwt = this.jwt.sign(user.toJSON());

    const data = {
      user: updated,
      token: jwt,
    };

    return { data, message: 'User registered successfully. OTP sent for verification.' };
  }
}
