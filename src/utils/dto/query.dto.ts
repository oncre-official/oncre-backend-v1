import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationDto } from './pagination.dto';

export class QueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'The module id' })
  _id?: string;
}
