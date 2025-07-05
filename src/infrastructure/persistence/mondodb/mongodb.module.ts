import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from '../schemas/task.schema';
import { ImageSchema } from '../schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://imageroot:imageroot321.@localhost:27017/image-processing?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: 'Task', schema: TaskSchema },
      { name: 'Image', schema: ImageSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongodbModule {}
