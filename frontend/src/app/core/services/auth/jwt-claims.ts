// Claims:
// sub - subject
// iat - issued at
// exp - expiration time
// role - user role
// id - user id
export interface JwtClaims {
  sub?: string;
  iat?: number;
  exp?: number;
  role?: string;
  id?: number;

  // Additional claims, eg. roles
  [key: string]: unknown;
}
