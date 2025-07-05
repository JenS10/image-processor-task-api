import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
})
export class AppModule {}
