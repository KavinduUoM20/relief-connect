import { IDonation } from '../../../interfaces/donation/IDonation';

/**
 * DTO for donation response
 */
export class DonationResponseDto implements IDonation {
  id: number;
  helpRequestId: number;
  donatorId: number;
  rationItems: Record<string, number>;
  donatorMarkedScheduled: boolean;
  donatorMarkedCompleted: boolean;
  ownerMarkedCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(donation: IDonation) {
    this.id = donation.id!;
    this.helpRequestId = donation.helpRequestId;
    this.donatorId = donation.donatorId;
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

