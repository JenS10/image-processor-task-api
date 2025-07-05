import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { CreateTaskUseCase } from 'src/application/use-cases/create-task.use-case';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [TaskController],
  providers: [CreateTaskUseCase],
})
export class TaskModule {}
