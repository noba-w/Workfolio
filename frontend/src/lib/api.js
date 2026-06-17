let _onRefresh = null;
let _refreshPromise = null;

export function setRefreshCallback(fn) {
  _onRefresh = fn;
}

function refreshOnce() {
  if (!_refreshPromise) {
    _refreshPromise = _onRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

function buildOpts(options, token) {
  return {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };
}

async function apiFetch(path, options = {}, token) {
  const res = await fetch(path, buildOpts(options, token));

  if (res.status === 401 && _onRefresh) {
    let newToken;
    try {
      newToken = await refreshOnce();
    } catch {
      throw new Error("Session expired. Please log in again.");
    }
    const retry = await fetch(path, buildOpts(options, newToken));
    if (retry.status === 204) return null;
    const retryData = await retry.json();
    if (!retry.ok) throw new Error(retryData.detail ?? "Something went wrong");
    return retryData;
  }

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Something went wrong");
  return data;
}

export const getClients = (token) =>
  apiFetch("/api/clients", {}, token);

export const createClient = (body, token) =>
  apiFetch("/api/clients", { method: "POST", body: JSON.stringify(body) }, token);

export const updateClient = (id, body, token) =>
  apiFetch(`/api/clients/${id}`, { method: "PATCH", body: JSON.stringify(body) }, token);

export const deleteClientPhoto = (id, token) =>
  apiFetch(`/api/clients/${id}/photo`, { method: "DELETE" }, token);

export const getProjects = (token) =>
  apiFetch("/api/projects", {}, token);

export const createProject = (body, token) =>
  apiFetch("/api/projects", { method: "POST", body: JSON.stringify(body) }, token);

export const createTimeEntry = (body, token) =>
  apiFetch("/api/time-entries", { method: "POST", body: JSON.stringify(body) }, token);
