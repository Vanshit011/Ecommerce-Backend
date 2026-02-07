import * as Joi from 'joi';
import { ProductStatus } from '../../../shared/constants/enum';

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  sale_price: Joi.number().optional().allow(null),
  sku: Joi.string().required(),
  brand: Joi.string().optional().allow(null, ''),
  stock_qty: Joi.number().integer().optional(),
  availability: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional(),
  category_id: Joi.string().required(), // Assuming UUID or string ID
  tags: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.object().optional(),
  weight: Joi.number().optional(),
  main_image_index: Joi.number().integer().optional(),
  is_active: Joi.boolean().optional(),
});

export const updateProductSchema = createProductSchema;
