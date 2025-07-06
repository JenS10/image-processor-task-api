import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { TaskStatus } from 'src/domain/entities/task.entity';
import { GetTaskResponseDto } from '../dtos/get-task-response.dto';

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: string): Promise<GetTaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    const response: GetTaskResponseDto = {
      taskId: task.taskId!,
      status: task.status,
      price: task.price,
    };

    if (
      task.status === TaskStatus.Completed &&
      task.images &&
      task.images?.length > 0
    ) {
      response.images = task.images.map((img) => ({
        resolution: img.resolution,
        path: img.path,
      }));
    }

    return response;
  }
}
