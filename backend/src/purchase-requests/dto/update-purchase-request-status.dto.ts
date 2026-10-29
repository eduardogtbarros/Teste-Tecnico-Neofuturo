import { IsIn } from 'class-validator';

export class UpdatePurchaseRequestStatusDto {
  @IsIn(['pending', 'approved', 'rejected'])
  status: string;
}