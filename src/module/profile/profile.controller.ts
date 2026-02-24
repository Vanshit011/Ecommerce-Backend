import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { ProfileService } from './profile.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import { updateProfileSchema } from './joi/profile.validation';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET MY PROFILE
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getProfile(@GetUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UsePipes(new JoiValidationPipe(updateProfileSchema))
  updateProfile(@GetUser('id') userId: string, @Body() body: UpdateProfileDto) {
    return this.profileService.updateProfile(userId, body);
  }
}
