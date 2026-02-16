import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    this.normalize(value);

    const { error, value: validated } = this.schema.validate(value, {
      abortEarly: false,
      convert: true, // ✅ string → number/boolean
      allowUnknown: true, // ✅ Allow unexpected fields
      stripUnknown: true, // ✅ Strip them from the output
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      throw new BadRequestException(messages);
    }

    return validated;
  }

  private normalize(body: any) {
    // ---- JSON fields ----
    if (body.specifications && typeof body.specifications === 'string') {
      body.specifications = this.safeJson(
        body.specifications,
        'specifications',
      );
    }

    if (body.tags && typeof body.tags === 'string') {
      body.tags = this.safeJson(body.tags, 'tags');
    }

    // ---- Variants normalization ----
    if (Array.isArray(body.variants)) {
      body.variants = body.variants.map((v) => ({
        ...v,
        price: v.price !== undefined ? Number(v.price) : v.price,
        stock_qty:
          v.stock_qty !== undefined ? Number(v.stock_qty) : v.stock_qty,
      }));
    }

    // ---- Boolean normalization ----
    if (body.is_active !== undefined) {
      body.is_active =
        body.is_active === true ||
        body.is_active === 'true' ||
        body.is_active === 1 ||
        body.is_active === '1';
    }

    // ---- Number normalization ----
    if (body.main_image_index !== undefined) {
      body.main_image_index = Number(body.main_image_index);
    }
  }

  private safeJson(value: string, field: string) {
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException(`${field} must be a valid JSON string`);
    }
  }
}
