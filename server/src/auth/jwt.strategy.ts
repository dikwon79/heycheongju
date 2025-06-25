import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private useRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey:
        configService.get('JWT_SECRET') ||
        'your-super-secret-jwt-key-for-development',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { email: string }) {
    const { email } = payload;
    const user = await this.useRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
    return user;
  }
}

export class JwtAuthGuard extends AuthGuard('jwt') {}
