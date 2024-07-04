import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../users/user.entity";
import { Repository } from "typeorm";
import { Request } from "express";
import * as bcrypt from "bcrypt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh-token"
) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  async validate(request: Request, payload) {
    const refreshToken = request.cookies?.Refresh;
    const { id } = payload;

    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRt
    );

    if (!user) {
      throw new UnauthorizedException();
    }
    if (isRefreshTokenMatching) {
      return user;
    }
  }
}
