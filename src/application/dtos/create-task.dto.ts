import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Path is required' })
  @ApiProperty({
    description: 'Path to the image to process',
    example: '/images/myphoto.jpg',
    required: true,
  })
  path: string;
}
