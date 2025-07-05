import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private mongooseIndicator: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    this.logger.log('-- Health check called --');
    return this.health.check([
      () => this.mongooseIndicator.pingCheck('mongodb'),
    ]);
  }
}
