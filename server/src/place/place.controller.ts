import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/user.entity';

@Controller()
export class PlaceController {
  constructor(private placeService: PlaceService) {}

  // Place 관련 - 모든 사용자가 조회 가능
  @Get('/places')
  getAllPlaces() {
    return this.placeService.getAllPlaces();
  }

  @Get('/places/:id')
  getPlaceById(@Param('id') id: number) {
    return this.placeService.getPlaceById(id);
  }

  // Place 관련 - 관리자만 접근 가능
  @Post('/places')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPlace(@Body() createPlaceDto: any, @Request() req) {
    return this.placeService.createPlace(createPlaceDto, req.user.id);
  }

  @Put('/places/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updatePlace(@Param('id') id: number, @Body() updatePlaceDto: any) {
    return this.placeService.updatePlace(id, updatePlaceDto);
  }

  @Delete('/places/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deletePlace(@Param('id') id: number) {
    return this.placeService.deletePlace(id);
  }

  // Spot 관련 - 모든 사용자가 조회 가능
  @Get('/places/:placeId/spots')
  getSpotsByPlace(@Param('placeId') placeId: number) {
    return this.placeService.getSpotsByPlace(placeId);
  }

  // Spot 관련 - 관리자만 접근 가능
  @Post('/places/:placeId/spots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createSpot(@Param('placeId') placeId: number, @Body() createSpotDto: any) {
    return this.placeService.createSpot(placeId, createSpotDto);
  }

  @Put('/spots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSpot(@Param('id') id: number, @Body() updateSpotDto: any) {
    return this.placeService.updateSpot(id, updateSpotDto);
  }

  @Delete('/spots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteSpot(@Param('id') id: number) {
    return this.placeService.deleteSpot(id);
  }
}
