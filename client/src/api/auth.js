import { request } from "./http.js"

export function loginWithGoogle() {
  window.location.href = "/api/auth/google"
}

export async function getMe() {
  return request("/auth/me")
}

export function logout() {
  localStorage.removeItem("token")
}