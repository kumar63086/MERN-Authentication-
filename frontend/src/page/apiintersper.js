import axios from "axios";

const server = "http://localhost:3000";

/* ================= COOKIE UTILS ================= */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: server,
  withCredentials: true, // important for cookies
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();

    // Attach CSRF token only for unsafe methods
    if (["post", "put", "patch", "delete"].includes(method)) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= QUEUE STATE ================= */
let isRefreshingJWT = false;
let isRefreshingCSRF = false;

let jwtQueue = [];
let csrfQueue = [];

/* ================= QUEUE HELPERS ================= */
const processQueue = (queue, error = null) => {
  queue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  queue.length = 0;
};

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorCode = data?.code || "";

    // ⛔ Prevent infinite loop on refresh endpoints
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    /* ================= CSRF HANDLING ================= */
    if (
      status === 403 &&
      errorCode.startsWith("CSRF_") &&
      !originalRequest._retry
    ) {
      if (isRefreshingCSRF) {
        return new Promise((resolve, reject) => {
          csrfQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshingCSRF = true;

      try {
        await api.post("/api/v1/auth/refresh-csrf");
        processQueue(csrfQueue);
        return api(originalRequest);
      } catch (err) {
        processQueue(csrfQueue, err);
        return Promise.reject(err);
      } finally {
        isRefreshingCSRF = false;
      }
    }

    /* ================= JWT HANDLING ================= */
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshingJWT) {
        return new Promise((resolve, reject) => {
          jwtQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshingJWT = true;

      try {
        await api.post("/api/v1/auth/refreshToken");
        processQueue(jwtQueue);
        return api(originalRequest);
      } catch (err) {
        processQueue(jwtQueue, err);
        return Promise.reject(err);
      } finally {
        isRefreshingJWT = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
