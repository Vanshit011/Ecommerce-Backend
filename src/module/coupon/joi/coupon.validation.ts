import * as Joi from 'joi';
import { DiscountType } from '../../../shared/constants/enum';

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  discount_type: Joi.string()
    .valid(...Object.values(DiscountType))
    .required(),
  discount_value: Joi.number().positive().required(),
  min_order_amount: Joi.number().min(0).optional(),
  max_discount_amount: Joi.number().positive().optional(),
  usage_limit: Joi.number().integer().min(0).optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
  is_active: Joi.boolean().optional(),
}).options({ convert: true });

export const validateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  cartTotal: Joi.number().positive().required(),
}).options({ convert: true });
