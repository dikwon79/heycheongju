import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { Place } from './place.entiry';
import { Spot } from '../spot/spot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Place, Spot])],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
