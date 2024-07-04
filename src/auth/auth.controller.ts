import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/signup.dto";
import { GetUser } from "./decorator/get-user.decorator";
import { GetCurrentUserId } from "./decorator/get-current-user.decorator";
import { FastifyReply } from "fastify";
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {
    console.log("AuthService:", authService);
  }

  @Post("/signup")
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ access_token: string }> {
    return this.authService.signUp(signUpDto, response);
  }

  @Post("/login")
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ access_token: string }> {
    return this.authService.login(loginDto, response);
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Post("/refresh-token")
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetUser() email: string,
    @Body() refresh_token: string
  ): Promise<{ access_token: string }> {
    return this.authService.refreshTokens(email, refresh_token);
  }
}
