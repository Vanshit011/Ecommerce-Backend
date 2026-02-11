import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../module/categories/entity/category.entity';
import { User } from '../module/user/entity/user.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User])],
  providers: [SeederService],
})
export class SeederModule {}
