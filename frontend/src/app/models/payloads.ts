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

export interface ApiResponse<T> {
  status?: boolean,
  message?: string,
  error?: string,
  token?: string,
  data?: T,
  user?: string,
}
