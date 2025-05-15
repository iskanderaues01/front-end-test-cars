import axios from "axios";

const API_URL = "http://localhost:8089/api/auth/";

const register = (username, email, password, role) => {
  return axios.post(API_URL + "signup", {
    username,
    email,
    password,
    role,
  });
};

/*const login = (username, password) => {
  return axios
    .post(API_URL + "signin", {
      username,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    });
};*/

const changePassword = (username, oldPassword, newPassword) => {
  return axios.post(API_URL + "change-password", {
    username,
    oldPassword,
    newPassword,
  });
};

const login = (username, password) => {
  return axios
      .post(API_URL + "signin", {
        username,
        password,
      })
      .then((response) => {
        const { token, type, id, username, email, roles } = response.data;

        if (token) {
          const userData = {
            token,
            tokenType: type,
            id,
            username,
            email,
            roles,
          };
          localStorage.setItem("user", JSON.stringify(userData));
        }

        return response.data;
      })
      .catch((error) => {
        console.error("Login error:", error);
        throw error;
      });
};

const logout = () => {
  localStorage.removeItem("user");
};
/// === NEW
export default {
  register,
  login,
  logout,
  changePassword, // <-- добавили здесь
};

