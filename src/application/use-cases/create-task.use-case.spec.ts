import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskUseCase } from '../use-cases/create-task.use-case';
import { Task, TaskStatus } from '../../domain/entities/task.entity';
import { Image } from 'src/domain/entities/image.entity';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { IImageRepository } from 'src/domain/repositories/image.respository';

import * as fs from 'fs';
import * as sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';

jest.mock('fs');
jest.mock('sharp');
jest.mock('crypto');
jest.mock('path');

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  let imageRepository: jest.Mocked<IImageRepository>;

  const taskMock: Task = {
    taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
    status: TaskStatus.Pending,
    price: 10.5,
    originalPath: 'path/to/image.jpg',
  };

  beforeEach(async () => {
    taskRepository = {
      create: jest.fn().mockResolvedValue(taskMock),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
    };

    imageRepository = {
      save: jest.fn().mockImplementation(async (image: Image) => image),
      findByTaskId: jest.fn().mockResolvedValue([]),
      findByMd5: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        { provide: ITaskRepository, useValue: taskRepository },
        { provide: IImageRepository, useValue: imageRepository },
      ],
    }).compile();

    useCase = module.get(CreateTaskUseCase);

    // Mocks
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('image'));
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

    (sharp as unknown as jest.Mock).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue(undefined),
    });

    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mocked-md5-hash'),
    });

    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.basename as jest.Mock).mockReturnValue('image');
    (path.extname as jest.Mock).mockReturnValue('.jpg');
  });

  it('should create a task and process images', async () => {
    const result = await useCase.execute('path/to/image.jpg');

    expect(taskRepository.create).toHaveBeenCalled();
    expect(imageRepository.save).toHaveBeenCalledTimes(2);
    expect(taskRepository.update).toHaveBeenCalledWith(
      taskMock.taskId,
      expect.objectContaining({
        status: TaskStatus.Completed,
        images: expect.any(Array),
      }),
    );
    expect(result.taskId).toBe(taskMock.taskId);
  });

  it('should handle failure during image processing', async () => {
    (sharp as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Sharp failed');
    });

    const result = await useCase.execute('path/to/image.jpg');

    expect(taskRepository.update).toHaveBeenCalledWith(
      taskMock.taskId,
      expect.objectContaining({
        status: TaskStatus.Failed,
      }),
    );
  });
});
