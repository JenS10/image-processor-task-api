import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { Task, TaskStatus } from 'src/domain/entities/task.entity';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(path: string): Promise<Task> {
    const price = this.calculatePrice(path);
    const newTask: Task = {
      status: TaskStatus.Pending,
      originalPath: path,
      price,
    };

    return this.taskRepository.create(newTask);
  }

  private calculatePrice(path: string): number {
    const wordCount = path.trim().split(/\s+/).length;
    return parseFloat((wordCount * 1.5).toFixed(2));
  }
}
