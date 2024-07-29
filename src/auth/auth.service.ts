import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import User from "../users/user.entity";
import { SignUpDto } from "./dto/signup.dto";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";
import { FastifyReply } from "fastify";

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  id: number;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async signUp(
    signUpDto: SignUpDto,
    response: FastifyReply
  ): Promise<{
    access_token: string;
    email: string;
    name: string;
  }> {
    const { name, email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    response.setCookie("Refresh", tokens.refresh_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: true,
    });

    return {
      access_token: tokens.access_token,
      email,
      name,
    };
  }

  async login(
    loginDto: LoginDto,
    response: FastifyReply
  ): Promise<{
    access_token: string;
    email: string;
    name: string;
  }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    response.setCookie("Refresh", tokens.refresh_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: true,
    });

    return {
      access_token: tokens.access_token,
      email,
      name: user.name,
    };
  }

  async refreshTokens(
    email: string,
    rt: string
  ): Promise<{ access_token: string; email: string; name: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException("Access Denied");

    const rtMatches = await bcrypt.compare(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException("Access Denied");

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return { access_token: tokens.access_token, email, name: user.name };
  }

  async logout(userId: number): Promise<boolean> {
    await this.userRepository.update(
      { id: userId, hashedRt: Not(IsNull()) },
      { hashedRt: null }
    );
    return true;
  }

  async updateRtHash(id: number, rt: string): Promise<void> {
    const hash = await bcrypt.hash(rt, 10);

    await this.userRepository.update({ id }, { hashedRt: hash });
  }

  async getTokens(id: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      id,
      email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("JWT_SECRET"),
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("JWT_REFRESH_TOKEN_SECRET"),
        expiresIn: "7d",
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
