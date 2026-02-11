import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Address } from './entity/address.entity';
// import { Repository } from 'typeorm';

describe('AddressService', () => {
  let service: AddressService;
  // let repo: Repository<Address>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(Address),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    // repo = module.get<Repository<Address>>(getRepositoryToken(Address));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
