import { UserRole, UserStatus } from '../../enums';

/**
 * User interface
 */
export interface IUser {
  id?: number;
  username: string;
  password?: string; // Optional, can be null if user hasn't set a password
  contactNumber?: string; // Contact number for verification and communication (only shown to help request owners)
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

