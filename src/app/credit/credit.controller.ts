import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';

import { CreditService } from './credit.service';
import { Credit } from './model/credit.model';

import type { Response, Request } from 'express';

@ApiTags('Credit')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/credits')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get credits',
    description: 'Allows admin get credits',
  })
  @ApiOkResponse({ description: 'Get credits successful ', type: [Credit] })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async findCredits(@Query() query: any, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const filter = requestFilter(query);

      const response = await this.creditService.find(filter);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
