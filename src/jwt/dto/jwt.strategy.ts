import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JWTUserEntity } from "./jwtuser.entity";
import { Repository } from "typeorm";
import { JwtPayload } from "../jwtpayload.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectRepository(JWTUserEntity)
        private authUserRepository: Repository<JWTUserEntity>,
        private configService: ConfigService,
      ) {
        // documentation - https://www.passportjs.org/packages/passport-jwt/ 
        super(
            {
                secretOrKey: configService.get('JWT_SECRET'),
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            }
        );
      }

      async validate(payload: JwtPayload): Promise<JWTUserEntity> {
        const { username } = payload;
        const user: JWTUserEntity = await this.authUserRepository.findOneBy({ username });
        if (!user) {
          throw new UnauthorizedException();
        }
        return user;
      }
}