import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { Task, TaskStatus } from 'src/domain/entities/task.entity';
import { IImageRepository } from 'src/domain/repositories/image.respository';
import { ImageProcessingService } from '../services/image-processing.service';
import { PriceCalculationService } from '../services/price-calculation.service';

@Injectable()
export class CreateTaskUseCase {
  private readonly logger = new Logger(CreateTaskUseCase.name);

  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IImageRepository)
    private readonly imageRepository: IImageRepository,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly priceCalculationService: PriceCalculationService,
  ) {}

  async execute(path: string): Promise<Task> {
    const price = this.priceCalculationService.calculatePrice();
    const newTask: Task = {
      status: TaskStatus.Pending,
      originalPath: path,
      price,
    };
    const createdTask = await this.taskRepository.create(newTask);

    if (createdTask && createdTask.taskId) {
      setImmediate(() => {
        this.processImage(createdTask).catch((error) => {
          const err = error as Error;
          this.logger.error(
            `-- Error processing image for task ${createdTask.taskId}: ${err.message} --`,
            err.stack,
          );
        });
      });
    } else {
      this.logger.error(
        `-- Task creation failed or is missing -- ${JSON.stringify(createdTask, null, 2)}`,
      );
    }

    return createdTask;
  }

  private async processImage(task: Task): Promise<void> {
    try {
      const images = await this.imageProcessingService.processImage(
        task.originalPath,
        task.taskId!,
      );

      for (const img of images) {
        await this.imageRepository.save(img);
      }

      task.status = TaskStatus.Completed;
      task.images = images;
      await this.taskRepository.update(task.taskId!, task);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `-- Error processing image for task ${task.taskId}: ${err.message} --`,
        err.stack,
      );

      task.status = TaskStatus.Failed;
      await this.taskRepository.update(task.taskId!, task);
    }
  }
}
