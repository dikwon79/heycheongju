import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EditProfileDto } from './dto/edit-profile.dto';
import { MarkerColor } from 'src/place/marker-color.enum';
import axios from 'axios';
import appleSignin from 'apple-signin-auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(authDto: AuthDto) {
    const { email, password } = authDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      loginType: 'email',
    });

    try {
      await this.userRepository.save(user);
      return { message: '회원가입 완료' };
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        throw new ConflictException('이미 존재하는 이메일입니다');
      }
      throw new InternalServerErrorException('회원가입 중 에러가 발생했습니다');
    }
  }

  private async getTokens(payload: { email: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async signIn(authDto: AuthDto) {
    const { email, password } = authDto;
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    const { accessToken, refreshToken } = await this.getTokens({ email });
    await this.updateHashedRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(user: User) {
    console.log('user', user);
    const { email } = user;

    const { accessToken, refreshToken } = await this.getTokens({ email });

    if (!user.hashedRefreshToken) {
      throw new ForbiddenException();
    }

    await this.updateHashedRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  private async updateHashedRefreshToken(id: number, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    try {
      await this.userRepository.update(id, { hashedRefreshToken });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  getProfile(user: User) {
    const { password, hashedRefreshToken, ...rest } = user;

    return { ...rest };
  }

  async editProfile(editProfileDto: EditProfileDto, user: User) {
    const profile = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();

    if (!profile) {
      throw new NotFoundException('존재 하지 않는 사용자 입니다.');
    }

    const { nickname, imageUri } = editProfileDto;

    profile.nickname = nickname;
    profile.imageUri = imageUri;

    try {
      await this.userRepository.save(profile);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '프로필 수정 중 에러가 발생했습니다',
      );
    }
  }

  async deleteRefreshToken(user: User) {
    try {
      await this.userRepository.update(user.id, { hashedRefreshToken: '' });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '프로필 삭제 중 에러가 발생했습니다.',
      );
    }
  }

  async deleteAccount(user: User) {
    try {
      await this.userRepository
        .createQueryBuilder('user')
        .delete()
        .from(User)
        .where('id = :id', { id: user.id })
        .execute();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        '탈퇴할수 없습니다. 남은 데이터가 있는지 확인해주세요.',
      );
    }
  }

  async updateCategory(
    categories: Record<keyof MarkerColor, string>,
    user: User,
  ) {
    const { RED, YELLOW, GREEN, BLUE, PURPLE } = MarkerColor;

    if (
      !Object.keys(categories).every((color: MarkerColor) =>
        [RED, YELLOW, GREEN, BLUE, PURPLE].includes(color),
      )
    ) {
      throw new BadRequestException('유효하지 않는 카테고리 입니다.');
    }

    user[RED] = categories[RED];
    user[YELLOW] = categories[YELLOW];
    user[GREEN] = categories[GREEN];
    user[BLUE] = categories[BLUE];
    user[PURPLE] = categories[PURPLE];

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '카테고리 수정 중 에러가 발생했습니다.',
      );
    }

    const { password, hashedRefreshToken, ...rest } = user;

    return { ...rest };
  }

  async kakaoLogin(kakaoToken: { token: string }) {
    // TODO: Implement Kakao OAuth login logic
    // 1. Verify Kakao token
    // 2. Get user info from Kakao
    // 3. Create or find user in database
    // 4. Generate JWT tokens

    const url = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      Authorization: `Bearer ${kakaoToken.token}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    try {
      const response = await axios.get(url, { headers });
      const userData = response.data;
      const { id: kakaoId, kakao_account } = userData;
      const nickname = kakao_account?.profile.nickname;
      const imageUri = kakao_account?.profile.thumbnail_image_url?.replace(
        /^http:/,
        'https:',
      );

      const existingUser = await this.userRepository.findOneBy({
        email: kakaoId,
      });

      if (existingUser) {
        const { accessToken, refreshToken } = await this.getTokens({
          email: existingUser.email,
        });
        await this.updateHashedRefreshToken(existingUser.id, refreshToken);
        return { accessToken, refreshToken };
      }

      const newUser = this.userRepository.create({
        email: kakaoId,
        password: nickname ?? '',
        nickname,
        kakaoImageUri: imageUri ?? null,
        loginType: 'kakao',
      });

      try {
        await this.userRepository.save(newUser);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'Kakao 로그인 중 에러가 발생했습니다.',
        );
      }

      const { accessToken, refreshToken } = await this.getTokens({
        email: newUser.email,
      });

      await this.updateHashedRefreshToken(newUser.id, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Kakao 로그인 중 에러가 발생했습니다.',
      );
    }
  }

  async googleLogin(googleToken: { token: string }) {
    // TODO: Implement Google OAuth login logic
    // 1. Verify Google token
    // 2. Get user info from Google
    // 3. Create or find user in database
    // 4. Generate JWT tokens
    throw new InternalServerErrorException(
      'Google 로그인 기능이 아직 구현되지 않았습니다.',
    );
  }

  async appleLogin(appleIdentity: {
    identityToken: string;
    appId: string;
    nickname: string | null;
  }) {
    const { identityToken, appId, nickname } = appleIdentity;

    try {
      const { sub: userAppleId } = await appleSignin.verifyIdToken(
        identityToken,
        {
          audience: appId,
          ignoreExpiration: true,
        },
      );

      const existingUser = await this.userRepository.findOneBy({
        email: userAppleId,
      });

      if (existingUser) {
        const { accessToken, refreshToken } = await this.getTokens({
          email: existingUser.email,
        });

        await this.updateHashedRefreshToken(existingUser.id, refreshToken);
        return { accessToken, refreshToken };
      }

      const newUser = this.userRepository.create({
        email: userAppleId,
        nickname: nickname === null ? '이름없음' : nickname,
        password: '',
        loginType: 'apple',
      });

      try {
        await this.userRepository.save(newUser);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }

      const { accessToken, refreshToken } = await this.getTokens({
        email: newUser.email,
      });

      await this.updateHashedRefreshToken(newUser.id, refreshToken);
      return { accessToken, refreshToken };
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        'Apple 로그인 도중 문제가 발생했습니다.',
      );
    }
  }
}
