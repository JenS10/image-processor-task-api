import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { HealthModule } from './infrastructure/health/health.module';

@Module({
  imports: [PersistenceModule, HealthModule],
})
export class AppModule {}
