import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { RolesGuard } from '../../core/guard/roles.guard';
import { AuthGuard } from '../../core/guard/auth.guard';
import { UserRole } from '../../shared/constants/enum';
import { Roles } from '../../core/decorator/roles.decorator';
import { AddressService } from '../address/address.service';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
@Roles(UserRole.USER)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  create(@Body() dto: CreateAddressDto, @GetUser('id') userId: string) {
    return this.addressService.create(userId, dto);
  }

  // GET one
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.addressService.getOne(id, userId);
  }

  @Put(':id/default')
  setDefault(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.addressService.setDefault(id, userId);
  }

  //UPDATE
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @GetUser('id') userId: string,
  ) {
    return this.addressService.update(id, userId, dto);
  }

  // SOFT DELETE
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.addressService.softDelete(id, userId);
  }
}
