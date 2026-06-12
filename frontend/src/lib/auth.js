async function request(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Something went wrong");
  return data;
}

export const loginUser = (email, password) =>
  request("/api/auth/login", { email, password });

export const registerUser = (name, email, password) =>
  request("/api/auth/register", { name, email, password });
