import { Schema, model, Document, Types } from 'mongoose';

export interface ImageDocument extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  resolution: string;
  path: string;
  md5: string;
  createdAt: Date;
}

export const ImageSchema = new Schema<ImageDocument>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  resolution: { type: String, required: true },
  path: { type: String, required: true },
  md5: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

/* Indexes */
ImageSchema.index({ taskId: 1 });
ImageSchema.index({ md5: 1 });

export const ImageModel = model<ImageDocument>('Image', ImageSchema);
