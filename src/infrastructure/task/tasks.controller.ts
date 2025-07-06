import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new task for image processing' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(@Body() dto: CreateTaskDto) {
    const task = await this.createTaskUseCase.execute(dto.path);
    return {
      taskId: task.taskId!,
      status: task.status,
      price: task.price,
    };
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Gets the task corresponding to the provided id' })
  @ApiParam({
    name: 'taskId',
    required: true,
    description: 'Task ID to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: GetTaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(@Param('taskId') taskId: string): Promise<GetTaskResponseDto> {
    return this.getTaskUseCase.execute(taskId);
  }
}
