import { Image } from '../entities/image.entity';

export const IImageRepository = Symbol('ImageRepository');

export interface IImageRepository {
  save(image: Image): Promise<Image>;
  findByTaskId(taskId: string): Promise<Image[]>;
  findByMd5(md5: string): Promise<Image | null>;
}
