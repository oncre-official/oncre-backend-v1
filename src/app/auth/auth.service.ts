import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TOKEN_TYPE, USER_STATUS } from '@on/enum';
import { getRandomNumber, normalizePhoneNumber } from '@on/helpers';
import { compareResource, hashResource } from '@on/helpers/password';
import { TermiiService } from '@on/services/termii/service';
import { ServiceResponse } from '@on/utils/types';

import { User } from '../user/model/user.model';
import { TokenRepository } from '../user/repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';

import { LoginDto, RegisterDto, ResetPinDto, SetPinDto, VerifyPhoneDto } from './dto/auth.dto';
import { IRegisterResponse, IVerifyPhoneResponse } from './types/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserRepository,
    // private readonly termii: TermiiService,
    private readonly token: TokenRepository,
  ) {}

  /**
   * STEP -1
   */

  public async register(payload: RegisterDto): Promise<ServiceResponse<IRegisterResponse>> {
    const { phone } = payload;

    let user = await this.user.findOne({ phone });
    if (user && user.phoneVerified) throw new ConflictException('User with this phone number already exists.');

    if (!user) user = await this.user.create({ phone });

    const otp = await this.createVerificationOtp(user);

    const data: IRegisterResponse = {
      phone,
      userId: user._id,
      otp,
    };

    return { data, message: 'User registered successfully. OTP sent for verification.' };
  }

  public async resendOtp(payload: RegisterDto): Promise<ServiceResponse<IRegisterResponse>> {
    const { phone } = payload;

    const user = await this.user.findOne({ phone });
    if (!user) throw new NotFoundException('user does not exist');
    if (user.phoneVerified) throw new ConflictException('User phone number already verified.');

    const otp = await this.createVerificationOtp(user);

    const data: IRegisterResponse = {
      phone,
      userId: user._id,
      otp,
    };

    return { data, message: 'OTP resent successfully.' };
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
      isLoggedIn: false,
    };

    return { data, message: 'User registered successfully. OTP sent for verification.' };
  }

  /**
   * STEP -2
   */

  public async setPin(userDoc: User, payload: SetPinDto): Promise<ServiceResponse<IVerifyPhoneResponse>> {
    const { pin } = payload;

    const hashPin = await hashResource(pin);

    const user = await this.user.updateById(userDoc._id, { pin: hashPin });

    const jwt = this.jwt.sign(user.toJSON());

    const data = {
      user,
      token: jwt,
      isLoggedIn: false,
    };

    return { data, message: 'User registered successfully. OTP sent for verification.' };
  }

  /**
   * STEP -3
   */

  public async signin(payload: LoginDto): Promise<ServiceResponse<IVerifyPhoneResponse>> {
    const { phone, pin } = payload;

    const user = await this.user.findOne({ phone });
    if (!user) throw new NotFoundException('User with this phone number does not exist.');

    if (!user.pin) throw new BadRequestException('User pin not set');
    if (!user.phoneVerified) throw new BadRequestException('Phone number not verified');

    const isValidPin: boolean = await compareResource(pin, user.pin);
    if (!isValidPin) throw new BadRequestException('Incorrect pin provided');

    user.pin = undefined;

    const jwt = this.jwt.sign(user.toJSON());

    const data = {
      user,
      token: jwt,
      isLoggedIn: true,
    };

    return { data, message: 'User login successfully.' };
  }

  /**
   * STEP -4
   */

  public async forgetPin(payload: RegisterDto): Promise<ServiceResponse<IRegisterResponse>> {
    const { phone } = payload;

    const user = await this.user.findOne({ phone });
    if (!user) throw new NotFoundException('User with this phone number does not exist.');
    if (!user.phoneVerified) throw new BadRequestException('Phone number not verified');

    const otp = await this.createVerificationOtp(user, TOKEN_TYPE.PIN_RESET);

    const data: IRegisterResponse = {
      phone,
      userId: user._id,
      otp,
    };

    return { data, message: 'OTP sent for PIN reset.' };
  }

  public async resetPin(payload: ResetPinDto): Promise<ServiceResponse<IVerifyPhoneResponse>> {
    const { phone, pin, otp } = payload;

    const user = await this.user.findOne({ phone });
    if (!user) throw new NotFoundException('User with this phone number does not exist.');

    const token = await this.token.findOne({ type: TOKEN_TYPE.PIN_RESET, token: otp });
    if (!token) throw new BadRequestException('Invalid OTP code.');

    if (token.userId.toString() !== user._id.toString()) throw new BadRequestException('Invalid user OTP.');
    if (token.expiresAt < new Date()) throw new BadRequestException('OTP has expired. Please request a new one.');

    const hashPin = await hashResource(pin);

    await this.user.updateById(user._id, { pin: hashPin });
    await token.deleteOne();

    const jwt = this.jwt.sign(user.toJSON());

    const data = {
      user,
      token: jwt,
      isLoggedIn: false,
    };

    return { data, message: 'PIN reset successfully.' };
  }

  /**
   * PRIVATE METHODS
   */
  private async createVerificationOtp(user: User, type: TOKEN_TYPE = TOKEN_TYPE.PHONE_VERIFICATION) {
    const otpCode = getRandomNumber();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.token.deleteMany({ userId: user._id, type });

    const token = String(otpCode);

    await this.token.create({
      userId: user._id,
      token,
      type,
      expiresAt,
    });

    // const message = `Your otp code is ${token} valid for 10 minutes`;
    // const to = normalizePhoneNumber(user.phone);

    // await this.termii.sendMessage(to, message);

    return token;
  }
}
