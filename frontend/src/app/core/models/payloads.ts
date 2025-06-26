export interface LoginPayload {
  username: string,
  password: string
}

export interface RegisterPayload {
  firstname: string,
  lastname: string,
  username: string,
  email: string,
  password: string,
}

export interface UserProfilePayload {
  weight: number,
  height: number,
  dietGoal: DietGoal,
  dietType: DietType,
  gender: Gender
}

export interface ApiResponse<T> {
  status?: boolean,
  message?: string,
  error?: string,
  token?: string,
  data?: T,
  user?: string,
}

export interface ChangePasswordPayload {
  oldPassword: string,
  newPassword: string,
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
