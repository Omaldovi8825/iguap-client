import {
  LOCAL_HOSTS,
  API_LOCAL_URL,
  API_PROD_URL,
  HOST_NAME,
} from "./constants.js";
import { logout } from "./utils.js";
export class Axiomi {
  static baseUrl = LOCAL_HOSTS.includes(HOST_NAME)
    ? API_LOCAL_URL
    : API_PROD_URL;
  // static baseUrl = API_PROD_URL;
  static baseApiUrl = `${this.baseUrl}api/`;

  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return new Promise(() => {});
    }
    const headers = { ...options.headers, Authorization: token };

    try {
      const response = await fetch(`${this.baseApiUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        return new Promise(() => {});
      }

      return response.json();
    } catch (error) {
      location.replace("./error.html");
    }
  }

  static async login(password) {
    const req = await fetch(`${this.baseApiUrl}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    return req.json();
  }

  static get(endpoint) {
    return this.request(endpoint);
  }

  static post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  static put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  static delete(endpoint, data) {
    return this.request(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}
