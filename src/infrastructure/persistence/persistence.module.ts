import { Module } from '@nestjs/common';
import { MongodbModule } from './mondodb/mongodb.module';

@Module({
  imports: [MongodbModule],
  exports: [MongodbModule], // exportamos para que otros módulos usen la conexión
})
export class PersistenceModule {}
