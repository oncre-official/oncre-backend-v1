import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';

import { CustomerService } from './customer.service';
import { Customer } from './model/customer.model';

import type { Response, Request } from 'express';

@ApiTags('Customer')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customers',
    description: 'Allows admin get customers',
  })
  @ApiOkResponse({ description: 'Get customers successful ', type: [Customer] })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async findCustomers(@Query() query: any, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const filter = requestFilter(query);

      const response = await this.customerService.find(filter);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
