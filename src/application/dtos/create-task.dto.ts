import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Path is required' })
  @Length(5, 200)
  path: string;
}
