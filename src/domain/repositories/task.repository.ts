import { Task } from '../entities/task.entity';

export const ITaskRepository = Symbol('TaskRepository');

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
}
