export interface ResetPasswordPayload {
  username: string;
  otp: string;
  newPassword: string;
}
