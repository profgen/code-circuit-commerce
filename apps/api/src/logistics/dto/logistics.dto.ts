import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateShipmentPackageDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsString()
  @MinLength(4)
  trackingNumber!: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsDateString()
  eta?: string;
}

export class UpdateShipmentStatusDto {
  @IsString()
  @MinLength(2)
  status!: string;

  @IsOptional()
  @IsDateString()
  eta?: string;
}
