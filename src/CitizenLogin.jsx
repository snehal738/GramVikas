
import { useState } from "react";

function CitizenLogin({ onBack, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/citizen/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

     sessionStorage.setItem("citizenToken", data.token);
sessionStorage.setItem(
  "citizenUsername",
  data.citizen?.username || username
);
sessionStorage.setItem(
  "citizenVillage",
  data.citizen?.village || ""
);

setMessage("Login successful!");

if (onLogin) onLogin(data.citizen);
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="citizen-auth">
      <h2>Citizen Login</h2>
<p>Log in to access your village services.</p>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <button type="button" onClick={onBack}>
        Back
      </button>
    </section>
  );
}

export default CitizenLogin;
