import { Test, TestingModule } from '@nestjs/testing';
import { PriceCalculationService } from '../services/price-calculation.service';

describe('PriceCalculationService', () => {
  let service: PriceCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceCalculationService],
    }).compile();

    service = module.get<PriceCalculationService>(PriceCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a price between 5 and 50 with 2 decimal places', () => {
    for (let i = 0; i < 100; i++) {
      const price = service.calculatePrice();
      expect(price).toBeGreaterThanOrEqual(5);
      expect(price).toBeLessThanOrEqual(50);
      expect(price).toBeCloseTo(parseFloat(price.toFixed(2)), 2);
    }
  });
});
