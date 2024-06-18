import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:3000", // 허용할 도메인
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 허용할 HTTP 메서드
    allowedHeaders: "Content-Type, Accept", // 허용할 헤더
    credentials: true, // 인증 쿠키 등을 포함할 수 있게 설정
  });
  await app.listen(3001);
}
bootstrap();
