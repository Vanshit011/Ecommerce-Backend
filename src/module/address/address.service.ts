import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entity/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private repo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto) {
    //check same address current user not added
    const existingAddress = await this.repo.findOne({
      where: {
        user_id: userId,
        address_line_1: dto.address_line_1,
        address_line_2: dto.address_line_2,
        city: dto.city,
        state: dto.state,
        postal_code: dto.postal_code,
      },
    });

    if (existingAddress) {
      throw new NotFoundException('Address already exists');
    }

    const address = this.repo.create({
      ...dto,
      user_id: userId,
    });

    return this.repo.save(address);
  }

  async getOne(id: string, userId: string) {
    const address = await this.repo.findOne({
      where: {
        id,
        user: { id: userId },
      },
    });

    if (!address) throw new NotFoundException('Address not found');

    return address;
  }

  async getAll(userId: string) {
    return this.repo.find({
      where: {
        user: { id: userId },
      },
      order: {
        is_default: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async setDefault(id: string, userId: string) {
    return this.repo.manager.transaction(async (manager) => {
      const address = await manager
        .createQueryBuilder(Address, 'address')
        .where('address.id = :id', { id })
        .andWhere('address.user_id = :userId', { userId })
        .getOne();

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // reset all
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ is_default: false })
        .where('"user_id" = :userId', { userId })
        .execute();

      // set selected
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ is_default: true })
        .where('id = :id', { id })
        .andWhere('"user_id" = :userId', { userId })
        .execute();

      return { message: 'Default address updated successfully' };
    });
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.getOne(id, userId);

    Object.assign(address, dto);

    return this.repo.save(address);
  }

  async softDelete(id: string, userId: string) {
    const result = await this.repo.softDelete({
      id,
      user: { id: userId },
    });

    if (!result.affected) throw new NotFoundException('Address not found');

    return { message: 'Address deleted' };
  }
}
