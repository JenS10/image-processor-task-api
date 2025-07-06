import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { HealthModule } from './infrastructure/health/health.module';
import { TasksModule } from './infrastructure/task/tasks.module';

@Module({
  imports: [PersistenceModule, HealthModule, TasksModule],
})
export class AppModule {}
