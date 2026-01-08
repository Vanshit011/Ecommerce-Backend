import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  updatePassword(email: string, hashedPassword: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  create(user: Partial<User>) {
    return this.userRepo.save(user);
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }
}
