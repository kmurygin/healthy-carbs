export interface UserProfilePayload {
  weight: number,
  height: number,
  dietGoal: DietGoal,
  dietType: DietType,
  gender: Gender
}

export interface ChangePasswordPayload {
  oldPassword: string,
  newPassword: string,
}

export interface AuthenticationResponse {
  token: string,
}

enum DietGoal {
  REDUCE,
  GAIN,
  MAINTAIN
}

enum Gender {
  MAN,
  WOMAN
}

enum DietType {
  VEGETARIAN,
  VEGAN
}
