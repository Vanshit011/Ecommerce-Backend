import {
    Controller,
    Post,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Body,
    Req,
    Put,
    Param,
    Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';
import { cloudinaryStorage } from '../../core/utils/cloudinary-storage';

@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) { }

    // admin only
    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: cloudinaryStorage,
        }),
    )
    create(
        @Body() dto: CreateProductDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const userId = req.user.id || req.user.sub;

        const imageUrl = file.path;
        const publicId = file.filename;

        return this.productService.create(dto, imageUrl, publicId, userId);
    }
    
    //admin product
    @Get('/my-products')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findMyProducts(@Req() req: any) {
        const userId = req.user.id || req.user.sub;
        return this.productService.findAllForAdmin(userId);
    }

    //user 
    @Get()
    findAll() {
        return this.productService.findAllForUsers();
    }

    //update product admin only
    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('image'))
    update(
        @Param('id') id: string,
        @Body() dto: Partial<CreateProductDto>,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const userId = req.user.id || req.user.sub;
        return this.productService.update(id, dto, userId, file);
    }

    //delete product admin only
    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id || req.user.sub;
        return this.productService.delete(id, userId);
    }

}
