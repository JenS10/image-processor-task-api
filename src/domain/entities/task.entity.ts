export interface TaskImage {
  resolution: string;
  path: string;
}

export enum TaskStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export interface Task {
  taskId?: string;
  status: TaskStatus;
  price: number;
  originalPath: string;
  images?: TaskImage[];
  createdAt?: Date;
  updatedAt?: Date;
}
