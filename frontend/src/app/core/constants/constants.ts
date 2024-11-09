const apiUrl = "http://localhost:8080/api/v1";

export const ApiEndpoints = {
  Auth: {
    Register: `${apiUrl}/auth/register`,
    Login: `${apiUrl}/auth/authenticate`,
  },

  User: {
    User: `${apiUrl}/users/`,
    GetUserByUsername: `${apiUrl}/users/getUserByUsername/`,
  }
};

export const LocalStorage = {
  token: "USER_TOKEN",
};
