export function saveAuth({ token, user }) {
  localStorage.setItem("zs_token", token);
  localStorage.setItem("zs_user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("zs_token");
}

export function getUser() {
  const raw = localStorage.getItem("zs_user");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem("zs_token");
  localStorage.removeItem("zs_user");
}
