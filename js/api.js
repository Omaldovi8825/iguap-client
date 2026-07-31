export class Axiomi {
  // static baseUrl = "https://iguapp-server.onrender.com/api/";
  static baseUrl = "http://localhost:3000/api/";

  static get(endpoint) {
    return fetch(`${this.baseUrl}${endpoint}`);
  }

  static post(endpoint, data) {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
}
