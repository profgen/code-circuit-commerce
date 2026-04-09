import { IsString, MinLength } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  channel!: 'EMAIL' | 'SMS' | 'PUSH';

  @IsString()
  @MinLength(3)
  template!: string;

  @IsString()
  payload!: string;
}
