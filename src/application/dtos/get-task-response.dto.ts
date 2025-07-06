export class ImageVariantDto {
  resolution: string;
  path: string;
}

export class GetTaskResponseDto {
  taskId: string;
  status: string;
  price: number;
  images?: ImageVariantDto[];
}
