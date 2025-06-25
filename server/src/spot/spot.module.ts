import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot } from './spot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spot])],
  exports: [TypeOrmModule],
})
export class SpotModule {}
