import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    'string.max': 'Name length must be less than or equal to 100 characters',
    'any.required': 'Name is required',
  }),
  description: Joi.string().optional().allow(null, ''),
  parentId: Joi.string().uuid().optional().allow(null),
});

export const updateCategorySchema = createCategorySchema;
