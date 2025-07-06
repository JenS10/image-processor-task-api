import { Injectable } from '@nestjs/common';
import { Image } from 'src/domain/entities/image.entity';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class ImageProcessingService {
  async processImage(originalPath: string, taskId: string): Promise<Image[]> {
    const resolutions = [1024, 800];
    const outputBaseDir = path.join(process.cwd(), 'output');
    const originalExtension = path.extname(originalPath);
    const originalFileName = path.basename(originalPath, originalExtension);

    if (!fs.existsSync(outputBaseDir)) {
      fs.mkdirSync(outputBaseDir, { recursive: true });
    }

    const fileBuffer = fs.readFileSync(originalPath);
    const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const processedImages: Image[] = [];

    for (const resolution of resolutions) {
      const outputDir = path.join(
        outputBaseDir,
        originalFileName,
        resolution.toString(),
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputFileName = `${md5Hash}${originalExtension}`;
      const outputPath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputPath)) {
        await sharp(originalPath).resize(resolution).toFile(outputPath);
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
