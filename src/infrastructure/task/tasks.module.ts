import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from 'src/application/use-cases/create-task.use-case';
import { PersistenceModule } from '../persistence/persistence.module';
import { GetTaskUseCase } from 'src/application/use-cases/get-task.use-case';
import { ImageProcessingService } from 'src/application/services/image-processing.service';
import { PriceCalculationService } from 'src/application/services/price-calculation.service';

@Module({
  imports: [PersistenceModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    GetTaskUseCase,
    ImageProcessingService,
    PriceCalculationService,
  ],
})
export class TasksModule {}
