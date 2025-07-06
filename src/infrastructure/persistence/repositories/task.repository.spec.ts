import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TaskRepository } from './task.repository';
import { Model } from 'mongoose';
import { TaskDocument } from '../schemas/task.schema';
import { Task, TaskStatus } from 'src/domain/entities/task.entity';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let model: Model<TaskDocument>;

  const mockTaskModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    populate: jest.fn(),
  };

  const taskMock: Task = {
    taskId: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
    status: TaskStatus.Pending,
    price: 10.5,
    originalPath: 'path/to/image.jpg',
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskRepository,
        {
          provide: getModelToken('Task'),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    repository = module.get<TaskRepository>(TaskRepository);
    model = module.get<Model<TaskDocument>>(getModelToken('Task'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      mockTaskModel.create.mockResolvedValue({
        ...taskMock,
        _id: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      });

      const result = await repository.create(taskMock);

      expect(mockTaskModel.create).toHaveBeenCalledWith(taskMock);
      expect(result.taskId).toBe('a7beec44-99e4-4be1-b305-a2828298ad1c');
      expect(result.status).toBe(TaskStatus.Pending);
    });
  });

  describe('update', () => {
    it('should update and return a task', async () => {
      mockTaskModel.findByIdAndUpdate.mockResolvedValue({
        ...taskMock,
        _id: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      });

      const result = await repository.update(
        'a7beec44-99e4-4be1-b305-a2828298ad1c',
        taskMock,
      );

      expect(mockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'a7beec44-99e4-4be1-b305-a2828298ad1c',
        taskMock,
        { new: true },
      );
      expect(result?.taskId).toBe('a7beec44-99e4-4be1-b305-a2828298ad1c');
    });

    it('should throw an error if task not found', async () => {
      mockTaskModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(repository.update('not_found', taskMock)).rejects.toThrow(
        'Taks not found',
      );
    });
  });

  describe('findById', () => {
    it('should return a task if found', async () => {
      const populateMock = jest.fn().mockResolvedValue({
        ...taskMock,
        _id: 'a7beec44-99e4-4be1-b305-a2828298ad1c',
      });
      mockTaskModel.findById.mockReturnValueOnce({
        populate: populateMock,
      } as any);

      const result = await repository.findById(
        'a7beec44-99e4-4be1-b305-a2828298ad1c',
      );

      expect(mockTaskModel.findById).toHaveBeenCalledWith(
        'a7beec44-99e4-4be1-b305-a2828298ad1c',
      );
      expect(populateMock).toHaveBeenCalledWith('images');
      expect(result?.taskId).toBe('a7beec44-99e4-4be1-b305-a2828298ad1c');
    });

    it('should return null if not found', async () => {
      const populateMock = jest.fn().mockResolvedValue(null);
      mockTaskModel.findById.mockReturnValueOnce({
        populate: populateMock,
      } as any);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
