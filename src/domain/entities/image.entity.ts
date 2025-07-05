export interface Image {
  id?: string;
  taskId: string;
  resolution: string;
  path: string;
  md5: string;
  createdAt?: Date;
}
