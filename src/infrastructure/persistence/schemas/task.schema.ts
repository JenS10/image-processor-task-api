import { Schema, model, Document, Types } from 'mongoose';
import {
  Task,
  TaskImage,
  TaskStatus,
} from '../../../domain/entities/task.entity';

export type TaskDocument = Document & {
  _id: Types.ObjectId;
} & Task;

const TaskImageSchema = new Schema<TaskImage>(
  {
    resolution: { type: String, required: true },
    path: { type: String, required: true },
  },
  { _id: false },
);

export const TaskSchema = new Schema<TaskDocument>(
  {
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      required: true,
    },
    price: { type: Number, required: true },
    originalPath: { type: String, required: true },
    images: { type: [TaskImageSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

/* Indexes */
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ status: 1 });

export const TaskModel = model<TaskDocument>('Task', TaskSchema);
