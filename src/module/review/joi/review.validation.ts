import * as Joi from 'joi';

export const createReviewSchema = Joi.object({
  rating: Joi.number().required(),
  comment: Joi.string().allow(null).allow(''),
});
export const updateReviewSchema = Joi.object({
  rating: Joi.number().optional(),
  comment: Joi.string().allow(null).allow('').optional(),
});
