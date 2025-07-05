import { Module } from '@nestjs/common';
import { MongodbModule } from './mondodb/mongodb.module';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { TaskRepository } from './repositories/task.repository';

@Module({
  imports: [MongodbModule],
  providers: [
    {
      provide: ITaskRepository,
      useClass: TaskRepository,
    },
  ],
  exports: [ITaskRepository, MongodbModule],
})
export class PersistenceModule {}
