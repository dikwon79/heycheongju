import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MarkerColor } from './marker-color.enum';
import { User } from '../auth/user.entity';
import { ColumnNumericTransformer } from 'src/@common/transformers/numeric.transformer';
import { Spot } from '../spot/spot.entity';

@Entity()
export class Place extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  address: string;

  @Column()
  markerColor: MarkerColor;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  latitude: number;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  longitude: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  businessHours: string;

  @Column({ nullable: true })
  priceRange: string;

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  mainImage: string;

  @Column({ nullable: true })
  badgeImage: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  audioGuide: string;

  @Column({ nullable: true })
  audioDescription: string;

  @Column({ nullable: true })
  videoGuide: string;

  @Column({ nullable: true })
  videoDescription: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // 생성자 정보 (관리자만 생성 가능)
  @Column({ nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  // Spot과의 관계
  @OneToMany(() => Spot, (spot) => spot.place)
  spots: Spot[];
}
