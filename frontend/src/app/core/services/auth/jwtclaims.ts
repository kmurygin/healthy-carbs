// Claims:
// sub - subject
// iat - issued at
// exp - expiration time
export interface JwtClaims {
  sub?: string;
  iat?: number;
  exp?: number;

  // Additional claims, eg. roles
  [key: string]: unknown;
}
