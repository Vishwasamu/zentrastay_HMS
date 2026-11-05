const BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost/ZentrastayHMS/backend/public";

async function request(path, options = {}) {
  const token =
    options.token ||
    localStorage.getItem("zs_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    "";

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(BASE + path, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || "Request failed";
    console.log("API ERROR", path, {
      status: res.status,
      statusText: res.statusText,
      message: msg,
      token: token ? `${token.substring(0, 20)}...` : "NO_TOKEN",
      response: data,
    });
    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path, opts = {}) => request(path, { ...opts, method: "GET" }),

  post: (path, body, opts = {}) =>
    request(path, {
      ...opts,
      method: "POST",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: JSON.stringify(body),
    }),

  postForm: (path, formData, opts = {}) =>
    request(path, {
      ...opts,
      method: "POST",
      headers: { ...(opts.headers || {}) },
      body: formData,
    }),

  put: (path, body, opts = {}) =>
    request(path, {
      ...opts,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: JSON.stringify(body),
    }),

  del: (path, opts = {}) =>
    request(path, {
      ...opts,
      method: "DELETE",
    }),
};
