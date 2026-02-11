import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
// import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  // let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
