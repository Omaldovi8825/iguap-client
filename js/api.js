const localHosts = ["localhost", "127.0.0.1"];
const PROD_URL = "https://iguapp-server.onrender.com/";
const LOCAL_URL = "http://localhost:3000/";

export class Axiomi {
  static baseUrl = localHosts.includes(location.hostname)
    ? LOCAL_URL
    : PROD_URL;
  static baseApiUrl = `${this.baseUrl}api/`;

  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      location.replace("./login.html");
      return new Promise(() => {});
    }

    const headers = { ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseApiUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        location.replace("./login.html");
        return new Promise(() => {});
      }

      return response.json();
    } catch (error) {
      location.replace("./error.html");
    }
  }

  static async login(data) {
    const req = await fetch(`${this.baseApiUrl}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
