import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCustomerDto {
  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  ownerId?: string;
}
