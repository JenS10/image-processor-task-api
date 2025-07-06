import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImageRepository } from './image.repository';
import { Image } from 'src/domain/entities/image.entity';
import { ImageDocument } from '../schemas/image.schema';

describe('ImageRepository', () => {
  let repository: ImageRepository;
  let model: Model<ImageDocument>;

  const mockImageModel = {
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockImage: Image = {
    id: '64d4a54b89c5e342b2c2c5f6',
    taskId: '64d4a54b89c5e342b2c2c5f7',
    resolution: '1024',
    path: '/output/image.jpg',
    md5: 'abc123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageRepository,
        {
          provide: getModelToken('Image'),
          useValue: mockImageModel,
        },
      ],
    }).compile();

    repository = module.get<ImageRepository>(ImageRepository);
    model = module.get<Model<ImageDocument>>(getModelToken('Image'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should update and return existing image if ID is present', async () => {
      mockImageModel.findByIdAndUpdate.mockResolvedValue({
        ...mockImage,
        _id: new Types.ObjectId(mockImage.id),
        taskId: new Types.ObjectId(mockImage.taskId),
      });

      const result = await repository.save(mockImage);

      expect(mockImageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockImage.id,
        mockImage,
        { new: true },
      );
      expect(result.id).toBe(mockImage.id);
    });

    it('should create a new image if ID is not present', async () => {
      const newImage = { ...mockImage, id: undefined };
      mockImageModel.create.mockResolvedValue({
        ...newImage,
        _id: new Types.ObjectId('64d4a54b89c5e342b2c2c5f6'),
        taskId: new Types.ObjectId(newImage.taskId),
      });

      const result = await repository.save(newImage);

      expect(mockImageModel.create).toHaveBeenCalledWith(newImage);
      expect(result.taskId).toBe(newImage.taskId);
    });

    it('should throw if image not found during update', async () => {
      mockImageModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(repository.save(mockImage)).rejects.toThrow(
        'Image not found',
      );
    });
  });

  describe('findByTaskId', () => {
    it('should return images matching taskId', async () => {
      mockImageModel.find.mockResolvedValue([
        {
          ...mockImage,
          _id: new Types.ObjectId(mockImage.id),
          taskId: new Types.ObjectId(mockImage.taskId),
        },
      ]);

      const result = await repository.findByTaskId(mockImage.taskId);

      expect(mockImageModel.find).toHaveBeenCalledWith({
        taskId: new Types.ObjectId(mockImage.taskId),
      });
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe(mockImage.taskId);
    });
  });

  describe('findByMd5', () => {
    it('should return image if md5 exists', async () => {
      mockImageModel.findOne.mockResolvedValue({
        ...mockImage,
        _id: new Types.ObjectId(mockImage.id),
        taskId: new Types.ObjectId(mockImage.taskId),
      });

      const result = await repository.findByMd5(mockImage.md5);

      expect(mockImageModel.findOne).toHaveBeenCalledWith({
        md5: mockImage.md5,
      });
      expect(result?.md5).toBe(mockImage.md5);
    });

    it('should return null if md5 not found', async () => {
      mockImageModel.findOne.mockResolvedValue(null);

      const result = await repository.findByMd5('nonexistent-md5');

      expect(result).toBeNull();
    });
  });
});
