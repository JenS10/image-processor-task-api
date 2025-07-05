import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from '../schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/image-processing'),
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
  ],
  exports: [MongooseModule],
})
export class MongodbModule {}
