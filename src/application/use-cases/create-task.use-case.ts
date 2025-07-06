import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { Task, TaskStatus } from 'src/domain/entities/task.entity';
import { IImageRepository } from 'src/domain/repositories/image.respository';
import { Image } from 'src/domain/entities/image.entity';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IImageRepository)
    private readonly imageRepository: IImageRepository,
  ) {}

  async execute(path: string): Promise<Task> {
    const price = this.calculatePrice();
    const newTask: Task = {
      status: TaskStatus.Pending,
      originalPath: path,
      price,
    };
    const createdTask = await this.taskRepository.create(newTask);

    if (createdTask && createdTask.taskId) {
      await this.processImage(createdTask);
    } else {
      console.error('Task creation failed or is missing.', createdTask);
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
      const imagePath = task.originalPath;
      const resolutions: number[] = [1024, 800];
      const outputBaseDir: string = path.join(process.cwd(), 'output');
      const originalExtension: string = path.extname(imagePath);
      const originalFileName: string = path.basename(
        imagePath,
        originalExtension,
      );
      const processedImages: Image[] = [];

      if (!fs.existsSync(outputBaseDir)) {
        fs.mkdirSync(outputBaseDir, { recursive: true });
      }

      const fileBuffer = fs.readFileSync(imagePath);
      const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

      for (const resolution of resolutions) {
        const outputDir = path.join(
          outputBaseDir,
          originalFileName,
          resolution.toString(),
        );
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFileName = `${md5Hash}${originalExtension}`;
        const outputPath = path.join(outputDir, outputFileName);

        if (!fs.existsSync(outputPath)) {
          await sharp(imagePath).resize(resolution).toFile(outputPath);
        }

        const image = await this.imageRepository.save({
          taskId: task.taskId,
          path: outputPath,
          resolution: resolution.toString(),
          md5: md5Hash,
        } as Image);

        processedImages.push(image);
      }

      task.status = TaskStatus.Completed;
      task.images = processedImages;

      await this.taskRepository.update(task.taskId!, task);
    } catch (error) {
      console.error(`Error processing image for task ${task.taskId}:`, error);
      task.status = TaskStatus.Failed;
      await this.taskRepository.update(task.taskId!, task);
    }
  }
}
