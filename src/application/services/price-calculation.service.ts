import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceCalculationService {
  calculatePrice(): number {
    const min = 5;
    const max = 50;
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }
}
