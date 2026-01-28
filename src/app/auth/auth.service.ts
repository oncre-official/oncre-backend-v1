import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ServiceResponse } from '@on/utils/types';

import { TokenRepository } from '../user/repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserRepository,
    private readonly token: TokenRepository,
  ) {}

  public async register(registerPayload: any): Promise<ServiceResponse<any>> {
    return { data: null, message: 'User registered successfully. OTP sent for verification.' };
  }
}
