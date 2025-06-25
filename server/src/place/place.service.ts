import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Place } from './place.entiry';
import { Spot } from '../spot/spot.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
    @InjectRepository(Spot)
    private spotRepository: Repository<Spot>,
  ) {}

  getAllPlaces() {
    return this.placeRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['creator', 'spots'],
    });
  }

  async getPlaceById(id: number) {
    const place = await this.placeRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['creator', 'spots'],
    });

    if (!place) {
      throw new NotFoundException('장소를 찾을 수 없습니다.');
    }

    return place;
  }

  async createPlace(createPlaceDto: any, createdBy: number) {
    const place = this.placeRepository.create({
      ...createPlaceDto,
      createdBy,
    });

    return await this.placeRepository.save(place);
  }

  async updatePlace(id: number, updatePlaceDto: any) {
    const place = await this.getPlaceById(id);

    Object.assign(place, updatePlaceDto);

    return await this.placeRepository.save(place);
  }

  async deletePlace(id: number) {
    const place = await this.getPlaceById(id);

    return await this.placeRepository.softDelete(id);
  }

  // Spot 관련 메서드들
  async getSpotsByPlace(placeId: number) {
    const place = await this.placeRepository.findOne({
      where: { id: placeId, deletedAt: IsNull() },
    });

    if (!place) {
      throw new NotFoundException('장소를 찾을 수 없습니다.');
    }

    return this.spotRepository.find({
      where: { placeId, deletedAt: IsNull() },
      order: { order: 'ASC' },
    });
  }

  async createSpot(placeId: number, createSpotDto: any) {
    const place = await this.placeRepository.findOne({
      where: { id: placeId, deletedAt: IsNull() },
    });

    if (!place) {
      throw new NotFoundException('장소를 찾을 수 없습니다.');
    }

    const spot = this.spotRepository.create({
      ...createSpotDto,
      placeId,
    });

    return await this.spotRepository.save(spot);
  }

  async updateSpot(id: number, updateSpotDto: any) {
    const spot = await this.spotRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!spot) {
      throw new NotFoundException('스팟을 찾을 수 없습니다.');
    }

    Object.assign(spot, updateSpotDto);

    return await this.spotRepository.save(spot);
  }

  async deleteSpot(id: number) {
    const spot = await this.spotRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!spot) {
      throw new NotFoundException('스팟을 찾을 수 없습니다.');
    }

    return await this.spotRepository.softDelete(id);
  }
}
