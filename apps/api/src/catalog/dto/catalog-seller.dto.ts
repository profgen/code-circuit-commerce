import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateSellerProductDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsInt()
  @Min(1)
  price!: number;

  @IsString()
  @MinLength(3)
  currency!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @MinLength(5)
  imageUrl!: string;

  @IsString()
  categoryId!: string;
}

export class UpdateSellerProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class RejectProductDto {
  @IsString()
  @MinLength(4)
  moderationNote!: string;
}
