import { IImageRepository } from 'src/domain/repositories/image.respository';
import { Image } from 'src/domain/entities/image.entity';
import { ImageDocument, ImageModel } from '../schemas/image.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ImageRepository implements IImageRepository {
  constructor(
    @InjectModel('Image') private readonly imageModel: Model<ImageDocument>,
  ) {}

  async save(image: Image): Promise<Image> {
    let imageDoc: ImageDocument | null;

    if (image.id) {
      imageDoc = await ImageModel.findByIdAndUpdate(image.id, image, {
        new: true,
      });
      if (!imageDoc) throw new Error('Image not found');
    } else {
      imageDoc = await this.imageModel.create(image);
    }

    return this.toDomain(imageDoc);
  }

  async findByTaskId(taskId: string): Promise<Image[]> {
    const imageDocs = await this.imageModel.find({
      taskId: new Types.ObjectId(taskId),
    });
    return imageDocs.map((doc) => this.toDomain(doc));
  }

  async findByMd5(md5: string): Promise<Image | null> {
    const imageDoc = await this.imageModel.findOne({ md5 });
    return imageDoc ? this.toDomain(imageDoc) : null;
  }

  private toDomain(imageDoc: ImageDocument): Image {
    return {
      id: imageDoc._id.toString(),
      taskId: imageDoc.taskId.toString(),
      resolution: imageDoc.resolution,
      path: imageDoc.path,
      md5: imageDoc.md5,
      createdAt: imageDoc.createdAt,
    };
  }
}
