import type {UserRole} from "@core/models/enum/user-role.enum";

export interface UserDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageId: number | null;
  role: UserRole;
  createdAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
}
