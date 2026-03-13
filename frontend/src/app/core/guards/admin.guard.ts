import {UserRole} from '@core/models/enum/user-role.enum';
import {createRoleGuard} from './role.guard';

export const adminGuard = createRoleGuard(UserRole.ADMIN);
