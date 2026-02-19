import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import {
  createCategorySchema,
  updateCategorySchema,
} from './joi/category.validation';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createCategorySchema))
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  // @UseGuards(AuthGuard, RolesGuard)
  async findAll(): Promise<Category[]> {
    const tree = await this.categoriesService.findAll();
    return tree;
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateCategorySchema))
  update(@Param('id') id: string, @Body() dto: Partial<Category>) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
