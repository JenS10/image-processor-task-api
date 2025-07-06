import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

import { ITaskRepository } from 'src/domain/repositories/task.repository';
import { Task } from 'src/domain/entities/task.entity';
import { TaskDocument } from '../schemas/task.schema';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectModel('Task') private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(task: Task): Promise<Task> {
    const created = await this.taskModel.create(task);
    return this.toDomain(created);
  }

  async update(id: string, task: Task): Promise<Task | null> {
    const taskDoc = await this.taskModel.findByIdAndUpdate(id, task, {
      new: true,
    });

    if (!taskDoc) throw new Error('Taks not found');

    return this.toDomain(taskDoc);
  }

  async findById(taskId: string): Promise<Task | null> {
    const taskDoc = await this.taskModel.findById(taskId).populate('images');
    if (!taskDoc) return null;

    return this.toDomain(taskDoc);
  }

  private toDomain(doc: TaskDocument): Task {
    return {
      taskId: doc._id.toString(),
      status: doc.status,
      price: doc.price,
      originalPath: doc.originalPath,
      images: doc.images,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
