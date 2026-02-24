import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user?: {
    id?: string;
    sub?: string;
    user_id?: string;
    [key: string]: any;
  };
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data === 'id') {
      return user?.id || user?.sub || user?.user_id;
    }

    return data && user ? user[data] : user;
  },
);
