import { IsObjectId } from 'src/common/validators/is-object-id.validator';

export class GetTaskParamsDto {
  @IsObjectId({
    message: 'Invalid taskId format: must be a 24-character hex string',
  })
  taskId: string;
}
