import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskUseCase } from './get-task.use-case';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from 'src/domain/entities/task.entity';
import { Image } from 'src/domain/entities/image.entity';

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;

  beforeEach(async () => {
    taskRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTaskUseCase,
        { provide: ITaskRepository, useValue: taskRepository },
      ],
    }).compile();

    useCase = module.get(GetTaskUseCase);
  });

  it('should return task details if found and not completed', async () => {
    const task = {
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Pending,
      price: 15.75,
      originalPath: 'input/image1.jpg',
      images: [],
    };

    taskRepository.findById.mockResolvedValue(task);

    const result = await useCase.execute(
      'a7beec44-99e4-4be1-b305-a2828298ad1c',
    );

    expect(result).toEqual({
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Pending,
      price: 15.75,
    });
  });

  it('should return task with images if completed', async () => {
    const task = {
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Completed,
      price: 42.99,
      originalPath: 'input/image1.jpg',
      images: [
        { resolution: '800', path: 'output/image1.jpg' } as Image,
        { resolution: '1024', path: 'output/image2.jpg' } as Image,
      ],
    };

    taskRepository.findById.mockResolvedValue(task);

    const result = await useCase.execute(
      'a7beec44-99e4-4be1-b305-a2828298ad1c',
    );

    expect(result).toEqual({
      taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      status: TaskStatus.Completed,
      price: 42.99,
      images: [
        { resolution: '800', path: 'output/image1.jpg' },
        { resolution: '1024', path: 'output/image2.jpg' },
      ],
    });
  });

  it('should throw NotFoundException if task is not found', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
