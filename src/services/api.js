import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Token en localStorage:", localStorage.getItem("token"));
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["X-App-Type"] = "backoffice";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setupInterceptors = (handleLogout) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        const authRoutes = ["/auth/login"];
        const requestUrl = error.response.config.url;
        if (!authRoutes.some((route) => requestUrl.includes(route))) {
          localStorage.removeItem("token");
          handleLogout(true);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
