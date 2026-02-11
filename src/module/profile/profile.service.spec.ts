import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
