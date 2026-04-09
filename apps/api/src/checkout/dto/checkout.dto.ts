import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CheckoutInitDto {
  @IsString()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsBoolean()
  useWallet?: boolean;
}

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsString()
  discountType!: 'PERCENTAGE' | 'FIXED';

  @IsInt()
  @Min(1)
  discountValue!: number;

  @IsInt()
  @Min(0)
  minOrderAmount!: number;

  @IsInt()
  @Min(1)
  maxRedemptionsPerUser!: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}
