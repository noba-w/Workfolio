async function apiFetch(path, options = {}, token) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Something went wrong");
  return data;
}

export const getClients = (token) =>
  apiFetch("/api/clients", {}, token);

export const createClient = (body, token) =>
  apiFetch("/api/clients", { method: "POST", body: JSON.stringify(body) }, token);
