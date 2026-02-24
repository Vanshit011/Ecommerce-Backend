import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException)
export class FileSizeExceptionFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Customize the response to be a 400
    const status = 400;

    response.status(status).json({
      statusCode: status,
      message: 'File too large. Maximum size allowed is 2MB.',
      error: 'Bad Request',
    });
  }
}
