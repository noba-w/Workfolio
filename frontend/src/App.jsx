import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("connecting...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error — backend not reachable"));
  }, []);

  return (
    <main>
      <h1>Workfolio</h1>
      <p>Your freelance work, at a glance.</p>
      <p className="status">
        API: <span>{status}</span>
      </p>
    </main>
  );
}
