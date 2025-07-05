import { Body, Controller, Post } from '@nestjs/common';
import { CreateTaskDto } from 'src/application/dtos/create-task.dto';
import { CreateTaskUseCase } from 'src/application/use-cases/create-task.use-case';

@Controller('task')
export class TaskController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const task = await this.createTaskUseCase.execute(dto.path);
    return {
      taskId: task.taskId!,
      status: task.status,
      price: task.price,
    };
  }
}
