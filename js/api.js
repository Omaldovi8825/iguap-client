export class Axiomi {
  // static baseUrl = "https://iguapp-server.onrender.com/api/";
  static baseUrl = "http://localhost:3000/api/";

  static async get(endpoint) {
    const getR = await fetch(`${this.baseUrl}${endpoint}`);
    return getR.json()
  }

  static async post(endpoint, data) {
    const postR = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return postR.json()
  }

  static async put(endpoint, data) {
    const putR = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return putR.json()
  }

  static async delete(endpoint, data) {
    const deleteR = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return deleteR.json();
  }
}
