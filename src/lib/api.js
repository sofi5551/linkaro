// Base URL for the linkaro-backend Express API.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://linkaro-backend.onrender.com";

// Fetch wrapper for calling linkaro-backend. Sends cookies (admin/mobile JWT)
// and defaults to JSON unless the body is FormData.
export async function apiFetch(path, options = {}) {
  const { headers, body, ...rest } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  return fetch(`${API_URL}${path}`, {
    credentials: "include",
    body,
    headers: isFormData
      ? headers
      : { "Content-Type": "application/json", ...headers },
    ...rest,
  });
}
