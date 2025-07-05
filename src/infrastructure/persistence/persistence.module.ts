import { Module } from '@nestjs/common';
import { MongodbModule } from './mondodb/mongodb.module';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { TaskRepository } from './repositories/task.repository';
import { IImageRepository } from 'src/domain/repositories/image.respository';
import { ImageRepository } from './repositories/image.repository';

@Module({
  imports: [MongodbModule],
  providers: [
    {
      provide: ITaskRepository,
      useClass: TaskRepository,
    },
    {
      provide: IImageRepository,
      useClass: ImageRepository,
    },
  ],
  exports: [ITaskRepository, IImageRepository, MongodbModule],
})
export class PersistenceModule {}
