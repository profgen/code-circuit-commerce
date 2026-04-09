import { IsString, MinLength } from 'class-validator';

export class ApplySellerDto {
  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsString()
  @MinLength(2)
  legalName!: string;

  @IsString()
  @MinLength(6)
  contactNumber!: string;
}
