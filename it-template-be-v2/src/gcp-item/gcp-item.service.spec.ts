import { Test, TestingModule } from '@nestjs/testing';
import { GcpItemService } from './gcp-item.service';

describe('GcpItemService', () => {
  let service: GcpItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcpItemService],
    }).compile();

    service = module.get<GcpItemService>(GcpItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
