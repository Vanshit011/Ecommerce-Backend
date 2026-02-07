import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entity/category.entity';
import { User, UserRole } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
    await this.seedAdminUser();
  }

  private async seedCategories() {
    try {
      const count = await this.categoryRepository.count();
      if (count === 0) {
        this.logger.log('Seeding Categories...');

        const rootCategory = this.categoryRepository.create({
          name: 'Root',
          description: 'Root Category',
        });

        await this.categoryRepository.save(rootCategory);
        this.logger.log("Seeded 'Root' category.");
      } else {
        this.logger.log('Categories already seeded, skipping.');
      }
    } catch (error) {
      this.logger.error('Error seeding categories', error);
    }
  }

  private async seedAdminUser() {
    try {
      const adminExists = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN },
      });

      if (!adminExists) {
        this.logger.log('Seeding Admin User...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = this.userRepository.create({
          name: 'Admin',
          email: 'admin@example.com',
          mobile: '0000000000',
          password: hashedPassword,
          role: UserRole.ADMIN,
        });

        await this.userRepository.save(adminUser);
        this.logger.log(
          "Seeded 'Admin' user (email: admin@example.com, password: admin123).",
        );
      } else {
        this.logger.log('Admin user already exists, skipping.');
      }
    } catch (error) {
      this.logger.error('Error seeding admin user', error);
    }
  }
}
