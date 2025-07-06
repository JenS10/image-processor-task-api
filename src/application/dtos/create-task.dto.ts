import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Path is required' })
  @Length(5, 200)
  @Matches(/^([a-zA-Z]:)?(\/|\\)[\w\-.\\/]+$/, {
    message: 'Invalid file path format',
  })
  @ApiProperty({
    description: 'Path to the image to process',
    example: '/images/myphoto.jpg',
    required: true,
  })
  path: string;
}
