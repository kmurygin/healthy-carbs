export interface ChangePasswordPayload {
  oldPassword: string,
  newPassword: string,
}

export interface AuthenticationResponse {
  token: string,
  refreshToken: string,
}
