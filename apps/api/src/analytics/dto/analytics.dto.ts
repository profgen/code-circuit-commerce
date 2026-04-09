import { IsOptional, IsString, MinLength } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @MinLength(2)
  eventName!: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsString()
  payload!: string;
}
