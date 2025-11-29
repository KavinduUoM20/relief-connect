import { IsString, IsNotEmpty, IsOptional, Length, MinLength, Matches } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateUserRequest } from '../../../interfaces/user/ICreateUserRequest';

/**
 * DTO for creating a new user
 * Backend DTO with validation decorators
 * Frontend should use ICreateUserRequest interface instead
 * Note: Role is not accepted from frontend - it's always set to USER by the backend
 */
export class CreateUserDto extends BaseDto implements IBodyDto, ICreateUserRequest {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  username!: string;

  @IsString({ message: 'Password must be a string' })
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters if provided' })
  password?: string;

  @IsString({ message: 'Contact number must be a string' })
  @IsOptional()
  @Length(8, 20, { message: 'Contact number must be between 8 and 20 characters' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Contact number must contain only digits, spaces, hyphens, plus signs, and parentheses' })
  contactNumber?: string;

  constructor(data?: Partial<ICreateUserRequest>) {
    super();
    if (data) {
      this.username = data.username || '';
      this.password = data.password;
      this.contactNumber = data.contactNumber;
    }
  }
}

