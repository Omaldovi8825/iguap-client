const PROD_URL = "https://iguapp-server.onrender.com/";
const LOCAL_URL = "http://localhost:3000/";

export class Axiomi {
  static baseUrl =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? LOCAL_URL
      : PROD_URL;
  static baseApiUrl = `${this.baseUrl}api/`;

  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    if (!token && endpoint !== "auth/login") {
      location.replace("./login.html");
      return new Promise(() => {});
    }

    const headers = { ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${this.baseApiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && endpoint !== "auth/login") {
      localStorage.removeItem("token");
      location.replace("./login.html");
      return new Promise(() => {});
    }

    return response.json();
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
