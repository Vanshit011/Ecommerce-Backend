import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ProductQueryParams } from '../../shared/constants/types';


export const ProductQuery = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): ProductQueryParams => {
        const request = ctx.switchToHttp().getRequest();

        const q = request.query;

        const page = Math.max(parseInt(q.page as string) || 1, 1);

        const limitRaw = parseInt(q.limit as string) || 10;
        const limit = Math.min(Math.max(limitRaw, 1), 50);

        const skip = (page - 1) * limit;

        const search = q.search
            ? String(q.search).trim()
            : undefined;

        //  CATEGORY FILTER
        const categories = q.category
            ? String(q.category)
                .split(',')
                .map((c) => c.trim().toLowerCase())
                .filter(Boolean)
            : undefined;

        const minPrice = q.minPrice
            ? Number(q.minPrice)
            : undefined;

        const maxPrice = q.maxPrice
            ? Number(q.maxPrice)
            : undefined;

        const sort = q.sort
            ? String(q.sort).toLowerCase()
            : undefined;


        return {
            page,
            limit,
            skip,
            search,
            categories,
            minPrice,
            maxPrice,
            sort,
        };
    },
);
