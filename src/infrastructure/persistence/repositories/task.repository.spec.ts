import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { TaskSchema } from '../schemas/task.schema';
import { TaskRepository } from './task.repository';
import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';

describe('TaskRepository (Integration)', () => {
  let module: TestingModule;
  let mongoServer: MongoMemoryServer;
  let taskRepository: ITaskRepository;
  let dbConnection: Connection;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
      ],
      providers: [
        TaskRepository,
        {
          provide: ITaskRepository,
          useExisting: TaskRepository,
        },
      ],
    }).compile();

    dbConnection = module.get<Connection>(getConnectionToken());

    await dbConnection.asPromise();

    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  afterEach(async () => {
    await dbConnection.collection('tasks').deleteMany({});
  });

  afterAll(async () => {
    await dbConnection.close();
    await mongoServer.stop();
    await module.close();
  });

  it('should create a task', async () => {
    const task: Task = {
      status: TaskStatus.Pending,
      price: 25,
      originalPath: '/sample/image.jpg',
      images: [],
    };

    const created = await taskRepository.create(task);
    console.log('created task ', created);

    expect(created).toBeDefined();
    expect(created.taskId).toBeDefined();
    expect(created.status).toBe(TaskStatus.Pending);
    expect(created.originalPath).toBe(task.originalPath);
  });
});
