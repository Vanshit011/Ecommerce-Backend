import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Post, Delete, Param } from '@nestjs/common';
import { FavoriteService } from '../../module/favorite/favorite.service';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  add(@Param('id') productId: string, @GetUser('id') userId: string) {
    return this.favoriteService.add(userId, productId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  remove(@Param('id') productId: string, @GetUser('id') userId: string) {
    return this.favoriteService.remove(userId, productId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getFavorites(@GetUser('id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.favoriteService.getFavorites(userId);
  }
}
