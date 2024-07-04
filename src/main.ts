import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import fastifyCookie from "@fastify/cookie";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.enableCors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept",
    credentials: true,
  });
  app.register(fastifyCookie, {
    secret: "dailyPaletterefreshTokenSecret",
  });
  await app.listen(3001);
}
bootstrap();
