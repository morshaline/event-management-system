import { API_BASE_URL } from "../config/appConfig";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const bodyText = await response.text();
  let data = null;

  if (bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = { message: bodyText };
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, payload) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  put: (path, payload) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};
