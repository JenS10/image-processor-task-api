import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Types } from 'mongoose';
import { ImageSchema } from '../schemas/image.schema';
import { ImageRepository } from './image.repository';
import { Image } from 'src/domain/entities/image.entity';
import { IImageRepository } from '../../../domain/repositories/image.respository';

describe('ImageRepository (Integration)', () => {
  let module: TestingModule;
  let mongoServer: MongoMemoryServer;
  let imageRepository: ImageRepository;
  let dbConnection: Connection;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
      ],
      providers: [
        ImageRepository,
        {
          provide: IImageRepository,
          useExisting: ImageRepository,
        },
      ],
    }).compile();

    dbConnection = module.get<Connection>(getConnectionToken());

    await dbConnection.asPromise();

    imageRepository = module.get<ImageRepository>(ImageRepository);
  });

  afterEach(async () => {
    await dbConnection.collection('image').deleteMany({});
  });

  afterAll(async () => {
    await dbConnection.close();
    await mongoServer.stop();
    await module.close();
  });

  it('should create a image', async () => {
    const image: Image = {
      taskId: new Types.ObjectId().toString(),
      resolution: '800x600',
      path: '/images/test.jpg',
      md5: 'abc123',
      createdAt: new Date(),
    };

    const created = await imageRepository.save(image);
    console.log('created image ', created);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.taskId).toBeDefined();
    expect(created.path).toBe(image.path);
  });
});
