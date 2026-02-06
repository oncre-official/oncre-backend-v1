import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';

import { AnalyticService } from './analytics.service';

import type { UserDocument } from '../user/model/user.model';
import type { Response, Request } from 'express';

@ApiTags('Analytics')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/analytics')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  // ---------------- CREDIT METRICS ----------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get credit metrics',
    description: 'Get credit dashboard metrics',
  })
  @ApiOkResponse({ description: 'Credit metrics fetched successfully', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Get('credit/metrics')
  async creditMetric(@User() user: UserDocument, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.analyticService.creditMetric(user);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  // ---------------- CUSTOMER BREAKDOWN ----------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customer entry breakdown',
    description: 'Get total customers, active customers, and newly added customers',
  })
  @ApiOkResponse({ description: 'Customer breakdown fetched successfully', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Get('customers/breakdown')
  async customerBreakdown(@User() user: UserDocument, @Req() req: Request, @Res() res: Response): Promise<ResponseDTO> {
    try {
      const response = await this.analyticService.customerBreakdown(user);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
