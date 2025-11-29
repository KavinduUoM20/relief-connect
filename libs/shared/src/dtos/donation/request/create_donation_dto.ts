import { IsNumber, IsNotEmpty, IsObject, Min } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateDonation } from '../../../interfaces/donation/ICreateDonation';

/**
 * DTO for creating a new donation
 * Backend DTO with validation decorators
 * Frontend should use ICreateDonation interface instead
 */
export class CreateDonationDto extends BaseDto implements IBodyDto, ICreateDonation {
  @IsNumber({}, { message: 'Help request ID must be a number' })
  @IsNotEmpty({ message: 'Help request ID is required' })
  @Min(1, { message: 'Help request ID must be greater than 0' })
  helpRequestId!: number;

  @IsObject({ message: 'Ration items must be an object' })
  @IsNotEmpty({ message: 'Ration items are required' })
  rationItems!: Record<string, number>;

  constructor(data?: Partial<ICreateDonation>) {
    super();
    if (data) {
      this.helpRequestId = data.helpRequestId || 0;
      this.rationItems = data.rationItems || {};
    }
  }
}

