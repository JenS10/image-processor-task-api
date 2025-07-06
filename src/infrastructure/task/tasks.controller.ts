import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTaskDto } from 'src/application/dtos/create-task.dto';
import { GetTaskResponseDto } from 'src/application/dtos/get-task-response.dto';
import { CreateTaskUseCase } from 'src/application/use-cases/create-task.use-case';
import { GetTaskUseCase } from 'src/application/use-cases/get-task.use-case';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const task = await this.createTaskUseCase.execute(dto.path);
    return {
      taskId: task.taskId!,
      status: task.status,
      price: task.price,
    };
  }

  @Get(':taskId')
  async getTask(@Param('taskId') taskId: string): Promise<GetTaskResponseDto> {
    return this.getTaskUseCase.execute(taskId);
  }
}
