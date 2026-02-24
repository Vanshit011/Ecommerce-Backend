import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  UsePipes,
  Patch,
  Delete,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { UserRole } from '../../shared/constants/enum';
import { Roles } from '../../core/decorator/roles.decorator';
import { GetUser } from 'src/core/decorator/get-user.decorator';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import {
  createReviewSchema,
  updateReviewSchema,
} from './joi/review.validation';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  //add reviews
  @UsePipes(new JoiValidationPipe(createReviewSchema))
  @Post(':productId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async createReview(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @GetUser('id') userId: string,
  ) {
    return await this.reviewService.createReview(
      userId,
      productId,
      createReviewDto,
    );
  }
  //get reviews single product
  @Get('product/:productId')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.USER)
  async getReviewsByProduct(@Param('productId') productId: string) {
    return await this.reviewService.getReviewsByProduct(productId);
  }
  //get average rating
  @Get('product/:productId/stats')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.USER)
  async getProductStats(@Param('productId') productId: string) {
    return await this.reviewService.getAverageRating(productId);
  }
  //update review
  @UsePipes(new JoiValidationPipe(updateReviewSchema))
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser('id') userId: string,
  ) {
    return await this.reviewService.updateReview(userId, id, updateReviewDto);
  }

  //delete review
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async deleteReview(@Param('id') id: string, @GetUser('id') userId: string) {
    await this.reviewService.deleteReview(userId, id);
    return { message: 'Review deleted successfully' };
  }
}
