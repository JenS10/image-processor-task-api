import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingService } from '../services/image-processing.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as sharp from 'sharp';
import axios from 'axios';

jest.mock('fs/promises');
jest.mock('path');
jest.mock('crypto');
jest.mock('sharp');
jest.mock('axios');

const mockConstants = {
  F_OK: 0,
};
(fs as any).constants = mockConstants;

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingService],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);
    mockedAxios = axios as jest.Mocked<typeof axios>;

    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('image-buffer'));
    (fs.copyFile as jest.Mock).mockResolvedValue(undefined);
    (fs.access as jest.Mock).mockResolvedValue(undefined);

    /* Mocks para path */
    (path.extname as jest.Mock).mockReturnValue('.jpg'); 
    (path.basename as jest.Mock).mockImplementation((p, ext) => {
      const base = p.split('/').pop();
      if (ext && base.endsWith(ext)) {
        return base.slice(0, -ext.length);
      }
      return base;
    });
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

    /* Mocks para crypto */
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mocked-md5-hash'),
    });

    /* Mocks para sharp */
    (sharp as unknown as jest.Mock).mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue(undefined),
    }));

    /* Mocks para axios */
    mockedAxios.get.mockResolvedValue({ data: Buffer.from('remote-image-buffer') });
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process a local image for given resolutions and return Image[]', async () => {
    const taskId = 'a7beec44-99e4-4be1-b305-a2828298ad1c';
    const originalPath = 'path/to/local/image.jpg';

    (path.extname as jest.Mock).mockReturnValueOnce('.jpg');
    (path.basename as jest.Mock).mockImplementationOnce((p, ext) => {
      const base = p.split('/').pop();
      if (ext && base.endsWith(ext)) {
        return base.slice(0, -ext.length);
      }
      return base;
    });

    (fs.access as jest.Mock).mockImplementation((pathToCheck, flag) => {
      if (pathToCheck === originalPath) {
        return Promise.resolve();
      }

      if (pathToCheck.includes('mocked-md5-hash')) {
        return Promise.reject(new Error('File does not exist, needs resizing'));
      }

      return Promise.resolve();
    });


    const images = await service.processImage(originalPath, taskId);

    expect(fs.access).toHaveBeenCalledWith(originalPath, mockConstants.F_OK);
    expect(fs.copyFile).toHaveBeenCalledWith(
      originalPath,
      expect.stringContaining('original.jpg'),
    );
    expect(fs.mkdir).toHaveBeenCalledTimes(3);
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('original.jpg'),
    );
    expect(crypto.createHash).toHaveBeenCalledWith('md5');
    expect(sharp).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).not.toHaveBeenCalled();

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

  it('should process a remote image for given resolutions and return Image[]', async () => {
    const taskId = 'b8cfd55-11e5-4cf2-c416-b3939393ad1d';
    const originalPath = 'https://urltest.com/remote/image.png';

    (path.extname as jest.Mock ).mockReturnValueOnce('.png');
    (path.basename as jest.Mock).mockImplementationOnce((p, ext) => {
      const base = p.split('/').pop();
      if (ext && base.endsWith(ext)) {
        return base.slice(0, -ext.length);
      }
      return base;
    });

    (fs.access as jest.Mock).mockImplementation((pathToCheck, flag) => {
      if (pathToCheck.includes('mocked-md5-hash')) {
        return Promise.reject(new Error('File does not exist, needs resizing'));
      }
      return Promise.resolve();
    });

    const images = await service.processImage(originalPath, taskId);

    expect(mockedAxios.get).toHaveBeenCalledWith(originalPath, { responseType: 'arraybuffer' });
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('original.png'),
      Buffer.from('remote-image-buffer'),
    );
    expect(fs.mkdir).toHaveBeenCalledTimes(3);
    expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('original.png'));
    expect(crypto.createHash).toHaveBeenCalledWith('md5');
    expect(sharp).toHaveBeenCalledTimes(2); 
    expect(fs.access).not.toHaveBeenCalledWith(originalPath, mockConstants.F_OK);
    expect(fs.copyFile).not.toHaveBeenCalled();

    expect(images).toHaveLength(2);
    expect(images[0]).toEqual({
      taskId,
      path: expect.stringContaining('mocked-md5-hash.png'),
      resolution: '1024',
      md5: 'mocked-md5-hash',
    });
    expect(images[1]).toEqual({
      taskId,
      path: expect.stringContaining('mocked-md5-hash.png'),
      resolution: '800',
      md5: 'mocked-md5-hash',
    });
  });

  it('should throw BadRequestException if local image does not exist', async () => {
    const taskId = 'c9dgec66-22f6-5de3-d527-c4040404ad1e';
    const originalPath = 'path/to/nonexistent/image.gif';

    (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));

    await expect(service.processImage(originalPath, taskId)).rejects.toThrow(
      `-- Image file at path "${originalPath}" does not exist --`,
    );
    expect(fs.access).toHaveBeenCalledWith(originalPath, mockConstants.F_OK);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if remote image download fails (404)', async () => {
    const taskId = 'd0hfed77-33g7-6ef4-e638-d5151515ad1f';
    const originalPath = 'https://urltest.com/nonexistent/image.jpeg';

    mockedAxios.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(service.processImage(originalPath, taskId)).rejects.toThrow(
      `The image from not ${originalPath} found (404)`,
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(originalPath, { responseType: 'arraybuffer' });
    expect(fs.access).not.toHaveBeenCalled();
  });

  it('should not resize image if it already exists at target resolution', async () => {
    const taskId = 'e1ifge88-44h8-7fg5-f749-e6262626ad20';
    const originalPath = 'path/to/existing/image.webp';

    (fs.access as jest.Mock).mockResolvedValue(undefined);

    (path.extname as jest.Mock).mockReturnValueOnce('.webp');
    (path.basename as jest.Mock).mockImplementationOnce((p, ext) => {
      const base = p.split('/').pop();
      if (ext && base.endsWith(ext)) {
        return base.slice(0, -ext.length);
      }
      return base;
    });

    const images = await service.processImage(originalPath, taskId);

    expect(sharp).not.toHaveBeenCalled();
    expect(images).toHaveLength(2);
    expect(images[0].path).toContain('mocked-md5-hash.webp');
    expect(images[1].path).toContain('mocked-md5-hash.webp');
  });
});
