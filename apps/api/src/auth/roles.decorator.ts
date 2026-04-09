import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'customer' | 'seller' | 'admin'>) =>
  SetMetadata(ROLES_KEY, roles);
