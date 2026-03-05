import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { UsersService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Otp } from './entity/otp.entity';
// import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  // let usersService: UsersService;
  // let mailService: MailService;
  // let tokenService: TokenService;
  // let otpRepo: Repository<Otp>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByMobile: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendOtpEmail: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generate: jest.fn(),
            revokeToken: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // usersService = module.get<UsersService>(UsersService);
    // mailService = module.get<MailService>(MailService);
    // tokenService = module.get<TokenService>(TokenService);
    // otpRepo = module.get<Repository<Otp>>(getRepositoryToken(Otp));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
