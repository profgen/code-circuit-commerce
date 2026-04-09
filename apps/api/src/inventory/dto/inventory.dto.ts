import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @MinLength(2)
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  city!: string;

  @IsString()
  @MinLength(2)
  country!: string;
}

export class UpdateWarehouseDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdjustStockDto {
  @IsString()
  warehouseId!: string;

  @IsString()
  productId!: string;

  @IsInt()
  delta!: number;

  @IsString()
  @MinLength(3)
  reason!: string;
}

export class SetStockDto {
  @IsString()
  warehouseId!: string;

  @IsString()
  productId!: string;

  @IsInt()
  @Min(0)
  available!: number;
}
