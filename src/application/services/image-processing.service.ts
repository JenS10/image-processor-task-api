import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Image } from 'src/domain/entities/image.entity';
import * as sharp from 'sharp';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  IMAGE_OUTPUT_DIR,
  IMAGE_RESOLUTIONS,
} from '../config/image-processing.config';
import axios from 'axios';
import {
  mkdir,
  writeFile,
  readFile,
  copyFile,
  access,
  constants,
} from 'fs/promises';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  async processImage(originalpath: string, taskId: string): Promise<Image[]> {
    const isRemote = /^https?:\/\//i.test(originalpath);

    const originalExtension = path.extname(originalpath);
    const originalFileName = path.basename(originalpath, originalExtension);
    const outputBaseDir = path.join(process.cwd(), IMAGE_OUTPUT_DIR);
    const imageDir = path.join(outputBaseDir, originalFileName);
    const originalDir = path.join(imageDir, 'original');
    const originalImagePath = path.join(
      originalDir,
      `original${originalExtension}`,
    );

    await mkdir(originalDir, { recursive: true });

    if (isRemote) {
      try {
        this.logger.log(`Downloading remote image from: ${originalpath}`);
        const response = await axios.get(originalpath, {
          responseType: 'arraybuffer',
        });
        await writeFile(originalImagePath, response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 404) {
            this.logger.error(
              `The image from ${originalpath} is not found (404)`,
            );
            throw new BadRequestException(
              `The image from not ${originalpath} found (404)`,
            );
          }
          this.logger.error(
            `Failed to download image, status: ${status || 'unknown'}`,
          );
          throw new BadRequestException(
            `Failed to download remote image: ${originalpath}`,
          );
        }
      }
    } else {
      try {
        await access(originalpath, constants.F_OK);
      } catch {
        this.logger.error(
          `-- Image file at path "${originalpath}" does not exist --`,
        );
        throw new BadRequestException(
          `-- Image file at path "${originalpath}" does not exist --`,
        );
      }

      this.logger.log(`Copying local image from: ${originalpath}`);
      await copyFile(originalpath, originalImagePath);
    }

    // Compute hash
    const fileBuffer = await readFile(originalImagePath);
    const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const processedImages: Image[] = [];

    // Process resolutions
    for (const resolution of IMAGE_RESOLUTIONS) {
      const resolutionDir = path.join(imageDir, resolution.toString());
      await mkdir(resolutionDir, { recursive: true });

      const outputFileName = `${md5Hash}${originalExtension}`;
      const outputPath = path.join(resolutionDir, outputFileName);

      try {
        await access(outputPath, constants.F_OK); // File already exists
        this.logger.log(`Image already resized at: ${outputPath}`);
      } catch {
        this.logger.log(`Resizing image to ${resolution}px`);
        await sharp(originalImagePath).resize(resolution).toFile(outputPath);
      }

      processedImages.push({
        taskId,
        path: outputPath,
        resolution: resolution.toString(),
        md5: md5Hash,
      } as Image);
    }

    return processedImages;
  }
}
