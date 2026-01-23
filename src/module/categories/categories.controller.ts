import { Body, Controller, Delete, Get, Param, Put, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService
    ) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    // @Roles(UserRole.ADMIN)
    findAll(): Promise<Category[]> {
        return this.categoriesService.findAll()
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
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

