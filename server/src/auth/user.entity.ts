import { MarkerColor } from 'src/place/marker-color.enum';
import { Place } from 'src/place/place.entiry';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loginType: 'email' | 'kakao' | 'google' | 'apple';

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  imageUri?: string;

  @Column({ nullable: true })
  kakaoImageUri?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true, default: '' })
  [MarkerColor.RED]: String;

  @Column({ nullable: true, default: '' })
  [MarkerColor.BLUE]: String;

  @Column({ nullable: true, default: '' })
  [MarkerColor.GREEN]: String;

  @Column({ nullable: true, default: '' })
  [MarkerColor.YELLOW]: String;

  @Column({ nullable: true, default: '' })
  [MarkerColor.PURPLE]: String;

  @Column({ default: 0 })
  totalPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @OneToMany(() => Place, (place) => place.creator)
  places: Place[];
}
