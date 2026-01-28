import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDTO {
  @ApiProperty({ type: 'boolean' })
  success: boolean;

  @ApiProperty()
  message: string;
}
