const API_URL = "http://localhost:5000/api";

export async function apiRequest(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
};

export const userApi = {
  getByRole: (role, token) => apiRequest(`/users?role=${role}`, {}, token),
};

export const appointmentApi = {
  getAll: (token) => apiRequest("/appointments", {}, token),
  create: (payload, token) =>
    apiRequest("/appointments", { method: "POST", body: JSON.stringify(payload) }, token),
  cancel: (id, token) => apiRequest(`/appointments/${id}`, { method: "DELETE" }, token),
};
