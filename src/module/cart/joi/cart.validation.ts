import * as Joi from 'joi';

export const addToCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).optional(),
  variant_id: Joi.string().optional().allow('', null),
  size: Joi.string().optional().allow('', null),
  color: Joi.string().optional().allow('', null),
});

export const updateQtySchema = Joi.number().integer().min(1).required();
