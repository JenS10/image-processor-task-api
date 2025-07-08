import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskUseCase } from '../use-cases/create-task.use-case';
import { Task, TaskStatus } from 'src/domain/entities/task.entity';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { IImageRepository } from 'src/domain/repositories/image.respository';
import { ImageProcessingService } from '../services/image-processing.service';
import { PriceCalculationService } from '../services/price-calculation.service';
import { Image } from 'src/domain/entities/image.entity';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  let imageRepository: jest.Mocked<IImageRepository>;
  let imageProcessingService: jest.Mocked<ImageProcessingService>;
  let priceCalculationService: jest.Mocked<PriceCalculationService>;

  const taskMock: Task = {
    taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
    status: TaskStatus.Pending,
    price: 10.5,
    originalPath: 'path/to/image.jpg',
  };

  const imagesMock: Image[] = [
    {
      taskId: taskMock.taskId!,
      path: 'output/path1.jpg',
      resolution: '1024',
      md5: 'hash1',
    },
    {
      taskId: taskMock.taskId!,
      path: 'output/path2.jpg',
      resolution: '800',
      md5: 'hash2',
    },
  ];

  beforeEach(async () => {
    taskRepository = {
      create: jest.fn().mockResolvedValue(taskMock),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
    };

    imageRepository = {
      save: jest.fn().mockImplementation(async (image) => image),
      findByTaskId: jest.fn().mockResolvedValue([]),
      findByMd5: jest.fn().mockResolvedValue(null),
    };

    imageProcessingService = {
      processImage: jest.fn().mockResolvedValue(imagesMock),
    } as unknown as jest.Mocked<ImageProcessingService>;

    priceCalculationService = {
      calculatePrice: jest.fn().mockReturnValue(10.5),
    } as jest.Mocked<PriceCalculationService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        { provide: ITaskRepository, useValue: taskRepository },
        { provide: IImageRepository, useValue: imageRepository },
        { provide: ImageProcessingService, useValue: imageProcessingService },
        { provide: PriceCalculationService, useValue: priceCalculationService },
      ],
    }).compile();

    useCase = module.get(CreateTaskUseCase);
  });

  it('should create task and process images', async () => {
    const result = await useCase.execute('path/to/image.jpg');

    // Wait a tick to allow setImmediate to run
    await new Promise((resolve) => setImmediate(resolve));

    expect(priceCalculationService.calculatePrice).toHaveBeenCalled();
    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TaskStatus.Pending,
        originalPath: 'path/to/image.jpg',
        price: 10.5,
      }),
    );

    expect(imageProcessingService.processImage).toHaveBeenCalledWith(
      'path/to/image.jpg',
      taskMock.taskId,
    );

    expect(imageRepository.save).toHaveBeenCalledTimes(imagesMock.length);
    expect(taskRepository.update).toHaveBeenCalledWith(
      taskMock.taskId,
      expect.objectContaining({
        status: TaskStatus.Completed,
        images: imagesMock,
      }),
    );

    expect(result.taskId).toBe(taskMock.taskId);
  });

  it('should handle errors in image processing and update task status to Failed', async () => {
    imageProcessingService.processImage.mockRejectedValue(
      new Error('Processing failed'),
    );

    await useCase.execute('path/to/image.jpg');

    await new Promise((resolve) => setImmediate(resolve));

    expect(taskRepository.update).toHaveBeenCalledWith(
      taskMock.taskId,
      expect.objectContaining({ status: TaskStatus.Failed }),
    );
  });
});
