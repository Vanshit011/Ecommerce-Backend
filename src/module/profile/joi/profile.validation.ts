import * as Joi from 'joi';

export const updateProfileSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Invalid email format',
  }),
  mobile: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(8)
    .max(15)
    .optional()
    .messages({
      'string.pattern.base': 'Mobile must contain only digits',
      'string.min': 'Mobile must be at least 8 digits',
      'string.max': 'Mobile must be at most 15 digits',
    }),
});
