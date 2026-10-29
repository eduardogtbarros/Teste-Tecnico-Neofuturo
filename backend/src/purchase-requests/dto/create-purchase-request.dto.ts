import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsString()
  @MaxLength(255)
  item_name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  supplier_id?: number;

  @IsString()
  @MaxLength(150)
  requester_name: string;

  @IsOptional()
  @IsString()
  justification?: string;
}