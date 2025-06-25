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
} from 'typeorm';
import { Place } from '../place/place.entiry';
import { ColumnNumericTransformer } from 'src/@common/transformers/numeric.transformer';
import { MarkerColor } from 'src/place/marker-color.enum';

@Entity()
export class Spot extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

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

  @Column()
  markerColor: MarkerColor;

  @Column({ nullable: true })
  mainImage: string;

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

  @Column({ default: 0 })
  order: number; // 순서

  // Place와의 관계
  @Column()
  placeId: number;

  @ManyToOne(() => Place, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placeId' })
  place: Place;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
