import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Debug: Log environment variables
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length || 0);
console.log('DB_PASSWORD value:', `"${process.env.DB_PASSWORD}"`);
console.log('DB_NAME:', process.env.DB_NAME);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3300;
  await app.listen(port);

  console.log(`Server is running on port ${port}`);
}
bootstrap();
