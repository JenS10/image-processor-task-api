import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingService } from '../services/image-processing.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

jest.mock('fs');
jest.mock('path');
jest.mock('crypto');
jest.mock('sharp');

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingService],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);

    /* Mocks fs */
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('image-buffer'));

    /* Mocks path */
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.extname as jest.Mock).mockReturnValue('.jpg');
    (path.basename as jest.Mock).mockReturnValue('image-file');

    /* Mocks crypto */
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mocked-md5-hash'),
    });

    /* Mocks sharp */
    (sharp as unknown as jest.Mock).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('should process image for given resolutions and return Image[]', async () => {
    const taskId = 'a7beec44-99e4-4be1-b305-a2828298ad1c';
    const originalPath = 'path/to/image.jpg';

    const images = await service.processImage(originalPath, taskId);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalledTimes(3);
    expect(fs.readFileSync).toHaveBeenCalledWith(originalPath);
    expect(crypto.createHash).toHaveBeenCalledWith('md5');
    expect(sharp).toHaveBeenCalledTimes(2);

    expect(images).toHaveLength(2);
    expect(images[0]).toEqual({
      taskId,
      path: expect.stringContaining('mocked-md5-hash.jpg'),
      resolution: '1024',
      md5: 'mocked-md5-hash',
    });
    expect(images[1]).toEqual({
      taskId,
      path: expect.stringContaining('mocked-md5-hash.jpg'),
      resolution: '800',
      md5: 'mocked-md5-hash',
    });
  });
});
