import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
        user: { id: userId },
        addressline1: dto.addressline1,
        addressline2: dto.addressline2,
        city: dto.city,
        state: dto.state,
        postalcode: dto.postalcode,
      },
    });

    if (existingAddress) {
      throw new NotFoundException('Address already exists');
    }

    const address = this.repo.create({
      ...dto,
      user: { id: userId },
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
        isdefault: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async setDefault(id: string, userId: string) {
    return this.repo.manager.transaction(async (manager) => {
      console.log('PARAM id:', id);
      console.log('PARAM userId:', userId);

      const all = await manager
        .createQueryBuilder(Address, 'address')
        .getMany();

      console.log('ALL ADDRESSES FROM ORM:', all);

      const address = await manager
        .createQueryBuilder(Address, 'address')
        .where('address.id = :id', { id })
        .andWhere('address.userId = :userId', { userId })
        .getOne();

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // reset all
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isdefault: false })
        .where('"userId" = :userId', { userId })
        .execute();

      // set selected
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isdefault: true })
        .where('id = :id', { id })
        .andWhere('"userId" = :userId', { userId })
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
