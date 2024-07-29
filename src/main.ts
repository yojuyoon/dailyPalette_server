import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import fastifyCookie from "@fastify/cookie";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const port = 3001;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const config = new DocumentBuilder()
    .setTitle("DailyPalette API")
    .setDescription("The DailyPalette API description")
    .setVersion("1.0")
    .build();
  app.enableCors();
  app.register(fastifyCookie, {
    secret: "dailyPaletterefreshTokenSecret",
  });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  await app.listen(port, "0.0.0.0");
}
bootstrap();
