import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTUserEntity } from './dto/jwtuser.entity';

export const getJwtUser = createParamDecorator(
  (data, ctx: ExecutionContext): JWTUserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
