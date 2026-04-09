import { IsString, MinLength } from 'class-validator';

export class CreateRefundRequestDto {
  @IsString()
  @MinLength(6)
  reason!: string;
}

export class ResolveRefundDto {
  @IsString()
  @MinLength(4)
  adminNote!: string;
}

export class ShipmentEventDto {
  @IsString()
  @MinLength(2)
  status!: string;

  @IsString()
  @MinLength(2)
  location!: string;

  @IsString()
  @MinLength(2)
  note!: string;
}

export class CancelOrderDto {
  @IsString()
  @MinLength(4)
  reason!: string;
}

export class CreateReturnRequestDto {
  @IsString()
  @MinLength(6)
  reason!: string;
}

export class ResolveReturnRequestDto {
  @IsString()
  @MinLength(4)
  adminNote!: string;
}
