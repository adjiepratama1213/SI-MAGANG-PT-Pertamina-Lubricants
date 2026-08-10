import { Test, TestingModule } from '@nestjs/testing';
import { GcpItemController } from './gcp-item.controller';
import { GcpItemService } from './gcp-item.service';

describe('GcpItemController', () => {
  let controller: GcpItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GcpItemController],
      providers: [GcpItemService],
    }).compile();

    controller = module.get<GcpItemController>(GcpItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
