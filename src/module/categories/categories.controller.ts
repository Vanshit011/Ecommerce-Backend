import { Body, Controller, Delete, Get, Param, Put, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService
    ) { }

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Get()
    findAll(): Promise<Category[]> {
        return this.categoriesService.findAll()
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: Partial<Category>) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.categoriesService.delete(id);
    }

}

