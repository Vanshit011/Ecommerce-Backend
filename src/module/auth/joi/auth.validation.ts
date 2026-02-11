import * as Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.base': 'Name must be a string.',
    'string.min': 'Name must be at least 2 characters long.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'any.required': 'Password is required.',
  }),
  mobile: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must contain only digits.',
      'string.min': 'Mobile number must be at least 10 digits.',
      'any.required': 'Mobile number is required.',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().optional(),
  mobile: Joi.string().optional(),
  otp: Joi.string().optional(),
})
  .or('email', 'mobile')
  .messages({
    'object.missing': 'Please provide either email or mobile number.',
  });

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().optional(),
  mobile: Joi.string().optional(),
}).or('email', 'mobile');

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});

export const verifyForgotOtpSchema = Joi.object({
  otp: Joi.string().required(),
});
