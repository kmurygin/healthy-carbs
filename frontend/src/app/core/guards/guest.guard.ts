import {createAuthStateGuard} from './role.guard';

export const guestGuard = createAuthStateGuard(false, '/');
