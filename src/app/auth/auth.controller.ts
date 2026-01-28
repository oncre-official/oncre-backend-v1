import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { AuthService } from './auth.service';
import { RegisterDto, VerifyPhoneDto } from './dto/auth.dto';

import type { Response, Request } from 'express';

@ApiTags('Auth')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Registers', description: 'Allows new users to register' })
  @ApiOkResponse({ description: 'User successful registration', type: ApiResponseDTO })
  @Post('register')
  async register(@Body() payload: RegisterDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.register(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'Phone OTP Verification',
    description: 'Allow user to verify phone number OTP',
  })
  @ApiOkResponse({ description: 'User successful verification', type: ApiResponseDTO })
  @Post('verify/phone')
  async verifyPhone(@Body() payload: VerifyPhoneDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.verify(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
