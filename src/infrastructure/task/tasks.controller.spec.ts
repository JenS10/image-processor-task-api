import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from 'src/application/use-cases/create-task.use-case';
import { GetTaskUseCase } from 'src/application/use-cases/get-task.use-case';
import { TaskStatus } from 'src/domain/entities/task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let createTaskUseCase: jest.Mocked<CreateTaskUseCase>;
  let getTaskUseCase: jest.Mocked<GetTaskUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: CreateTaskUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetTaskUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    createTaskUseCase = module.get(CreateTaskUseCase);
    getTaskUseCase = module.get(GetTaskUseCase);
  });

  it('should create a task and return minimal response', async () => {
    const mockTask = {
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Pending,
      price: 15.5,
      originalPath: '/path/image.jpg',
    };

    createTaskUseCase.execute.mockResolvedValue(mockTask);

    const result = await controller.create({ path: '/path/image.jpg' });

    expect(result).toEqual({
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Pending,
      price: 15.5,
    });
    expect(createTaskUseCase.execute).toHaveBeenCalledWith('/path/image.jpg');
  });

  it('should return task by ID', async () => {
    const mockResponse = {
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Completed,
      price: 20,
      images: [
        { path: '/img1.jpg', resolution: '1024' },
        { path: '/img2.jpg', resolution: '800' },
      ],
    };

    getTaskUseCase.execute.mockResolvedValue(mockResponse);

    const result = await controller.getTask(
      'a7beec44-99e4-4be1-b305-a2828298ad1c',
    );

    expect(result).toEqual(mockResponse);
    expect(getTaskUseCase.execute).toHaveBeenCalledWith(
      'a7beec44-99e4-4be1-b305-a2828298ad1c',
    );
  });
});
