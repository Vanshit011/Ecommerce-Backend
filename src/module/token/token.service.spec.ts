import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
// import { Repository } from 'typeorm';

describe('TokenService', () => {
  let service: TokenService;
  // let jwtService: JwtService;
  // let tokenRepo: Repository<Token>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    // jwtService = module.get<JwtService>(JwtService);
    // tokenRepo = module.get<Repository<Token>>(getRepositoryToken(Token));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
