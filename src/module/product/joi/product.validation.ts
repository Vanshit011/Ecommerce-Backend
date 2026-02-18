import * as Joi from 'joi';
import { ProductStatus } from '../../../shared/constants/enum';

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),

  description: Joi.string().trim().required(),

  brand: Joi.string().trim().optional().allow(null, ''),

  availability: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional(),

  category_id: Joi.string().uuid().required(),

  tags: Joi.array().items(Joi.string().trim()).optional(),

  specifications: Joi.object().optional(),

  price: Joi.number().positive().optional(),

  sale_price: Joi.number().positive().optional(),

  sku: Joi.string().trim().optional(),

  stock_qty: Joi.number().integer().min(0).optional(),

  weight: Joi.number().positive().optional(),

  main_image_index: Joi.number().integer().min(0).optional(),

  is_active: Joi.boolean().optional(),

  variants: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        color: Joi.string().trim().optional().allow(null, ''),
        size: Joi.string().trim().optional().allow(null, ''),
        price: Joi.number().positive().required(),
        stock_qty: Joi.number().integer().min(0).required(),
        sku: Joi.string().trim().required(),
      }),
    )
    .min(1)
    .optional(),
}).options({ convert: true });

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().optional(),

  description: Joi.string().trim().optional(),

  brand: Joi.string().trim().optional().allow(null, ''),

  availability: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional(),

  category_id: Joi.string().uuid().optional(),

  price: Joi.number().positive().optional(),

  sale_price: Joi.number().positive().optional(),

  sku: Joi.string().trim().optional(),

  stock_qty: Joi.number().integer().min(0).optional(),

  main_image_index: Joi.number().integer().min(0).optional(),

  is_active: Joi.boolean().optional(),
}).options({ convert: true });

export const addVariantSchema = Joi.object({
  color: Joi.string().trim().optional().allow(null, ''),
  size: Joi.string().trim().optional().allow(null, ''),
  price: Joi.number().positive().optional(),
  stock_qty: Joi.number().integer().min(0).optional(),
  sku: Joi.string().trim().optional(),
}).options({ convert: true });

export const updateVariantSchema = Joi.object({
  color: Joi.string().trim().optional().allow(null, ''),
  size: Joi.string().trim().optional().allow(null, ''),
  price: Joi.number().positive().optional(),
  stock_qty: Joi.number().integer().min(0).optional(),
  sku: Joi.string().trim().optional(),
}).options({ convert: true });

export const bulkUpdateVariantSchema = Joi.object({
  variants: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        color: Joi.string().trim().optional().allow(null, ''),
        size: Joi.string().trim().optional().allow(null, ''),
        price: Joi.number().positive().optional(),
        stock_qty: Joi.number().integer().min(0).optional(),
        sku: Joi.string().trim().optional(),
      }).unknown(true),
    )
    .sparse()
    .optional(),
}).options({ convert: true });
