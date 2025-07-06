import { ApiProperty } from '@nestjs/swagger';

export class ImageDto {
  @ApiProperty({ description: 'Resolution of the image' })
  resolution: string;

  @ApiProperty({ description: 'Path where the image is stored' })
  path: string;
}

export class GetTaskResponseDto {
  @ApiProperty({ description: 'Unique id of the task' })
  taskId: string;

  @ApiProperty({ description: 'Current status of the task' })
  status: string;

  @ApiProperty({ description: 'Price of the task' })
  price: number;

  @ApiProperty({
    description: 'List of processed images',
    type: [ImageDto],
    required: false,
  })
  images?: ImageDto[];
}
