/**
 * Donation interface
 * Represents a donation made by a donator to a help request
 */
export interface IDonation {
  id?: number;
  helpRequestId: number; // The help request this donation is for
  donatorId: number; // The user (donator) making the donation
  rationItems: Record<string, number>; // Map of ration item IDs to counts (e.g., { 'dry_rations': 5, 'bottled_water': 10 })
  donatorMarkedScheduled?: boolean; // Whether donator marked as scheduled
  donatorMarkedCompleted?: boolean; // Whether donator marked as completed
  ownerMarkedCompleted?: boolean; // Whether help request owner marked as completed
  createdAt?: Date;
  updatedAt?: Date;
}

