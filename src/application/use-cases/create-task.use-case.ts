import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { Task, TaskStatus } from 'src/domain/entities/task.entity';
import { IImageRepository } from 'src/domain/repositories/image.respository';
import { ImageProcessingService } from '../services/image-processing.service';
import { PriceCalculationService } from '../services/price-calculation.service';
import * as fs from 'fs';

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
    if (!fs.existsSync(path)) {
      this.logger.error(`-- Image file at path "${path}" does not exist --`);
      throw new BadRequestException(
        `Image file at path "${path}" does not exist`,
      );
    }

    const price = this.priceCalculationService.calculatePrice();
    const newTask: Task = {
      status: TaskStatus.Pending,
      originalPath: path,
      price,
    };
    const createdTask = await this.taskRepository.create(newTask);

    if (createdTask && createdTask.taskId) {
      await this.processImage(createdTask);
    } else {
      this.logger.error(
        `-- Task creation failed or is missing -- ${JSON.stringify(createdTask, null, 2)}`,
      );
    }

    return createdTask;
  }

  private calculatePrice(): number {
    const min = 5;
    const max = 50;
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
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
        `Error processing image for task ${task.taskId}: ${err.message}`,
        err.stack,
      );

      task.status = TaskStatus.Failed;
      await this.taskRepository.update(task.taskId!, task);
    }
  }
}
