import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { HealthModule } from './infrastructure/health/health.module';
import { TaskModule } from './infrastructure/task/task.module';

@Module({
  imports: [PersistenceModule, HealthModule, TaskModule],
})
export class AppModule {}
