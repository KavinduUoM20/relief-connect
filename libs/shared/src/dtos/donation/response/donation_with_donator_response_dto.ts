import { IDonation } from '../../../interfaces/donation/IDonation';
import { IUser } from '../../../interfaces/user/IUser';

/**
 * Extended DTO for donation response that includes donator information
 * Contact number is only included if the requester is the help request owner
 */
export class DonationWithDonatorResponseDto {
  id: number;
  helpRequestId: number;
  donatorId: number;
  donatorUsername?: string;
  donatorContactNumber?: string; // Only included if requester is the help request owner
  rationItems: Record<string, number>;
  donatorMarkedScheduled: boolean;
  donatorMarkedCompleted: boolean;
  ownerMarkedCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    donation: IDonation & { donator?: { id: number; username: string; contactNumber?: string } },
    includeContactNumber: boolean = false
  ) {
    this.id = donation.id!;
    this.helpRequestId = donation.helpRequestId;
    this.donatorId = donation.donatorId;
    this.donatorUsername = donation.donator?.username;
    if (includeContactNumber && donation.donator?.contactNumber) {
      this.donatorContactNumber = donation.donator.contactNumber;
    }
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

