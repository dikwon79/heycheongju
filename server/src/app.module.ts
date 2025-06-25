import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceModule } from './place/place.module';
import { SpotModule } from './spot/spot.module';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { Place } from './place/place.entiry';
import { Spot } from './spot/spot.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Place, Spot],
      synchronize: true,
    }),
    PlaceModule,
    SpotModule,
    AuthModule,
  ],

  providers: [],
})
export class AppModule {}
