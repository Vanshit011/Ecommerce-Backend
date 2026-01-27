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

  async setDefault(id: string, userId: string) {
    // check address to user
    const address = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    //if alreday true return
    if (address.isdefault === true) {
      throw new NotFoundException('Address is already default address');
    }
    // remove existing default
    await this.repo
      .createQueryBuilder()
      .update(Address)
      .set({ isdefault: false })
      .where('user_id = :userId', { userId })
      .andWhere('isdefault = true')
      .execute();

    // set new default
    address.isdefault = true;
    return this.repo.save(address);
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
