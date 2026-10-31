const PROD_URL = "https://iguapp-server.onrender.com/";
const LOCAL_URL = "http://localhost:3000/";

export class Axiomi {
  static baseUrl =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? LOCAL_URL
      : PROD_URL;
  static baseApiUrl = `${this.baseUrl}api/`;

  static async load() {
    const getR = await fetch(this.baseUrl);
    return getR.json();
  }

  static async get(endpoint) {
    const getR = await fetch(`${this.baseApiUrl}${endpoint}`);
    return getR.json();
  }

  static async post(endpoint, data) {
    const postR = await fetch(`${this.baseApiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return postR.json();
  }

  static async put(endpoint, data) {
    const putR = await fetch(`${this.baseApiUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return putR.json();
  }

  static async delete(endpoint, data) {
    const deleteR = await fetch(`${this.baseApiUrl}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return deleteR.json();
  }
}
