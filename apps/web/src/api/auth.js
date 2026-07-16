import { request } from "./client.js";

export function signup(email, password) {
  return request("/auth/signup", { method: "POST", body: { email, password } });
}

export function login(email, password) {
  return request("/auth/login", { method: "POST", body: { email, password } });
}
