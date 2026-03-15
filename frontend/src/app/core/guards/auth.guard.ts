import {createAuthStateGuard} from './role.guard';

export const authGuard = createAuthStateGuard(true, '/index');
