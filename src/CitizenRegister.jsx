
import { useState } from "react";

function CitizenRegister({ onBack, onRegistered }) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    village: "",
    mobile: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/citizen/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage(data.message || "Registration submitted successfully.");
      if (onRegistered) onRegistered();
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="citizen-auth">
      <p>Register for your GramVikas citizen account.</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label>Password (minimum 8 characters)</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <label>Village</label>
        <input
          name="village"
          value={form.village}
          onChange={handleChange}
          required
        />

        <label>Mobile Number (optional)</label>
        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
        />

        <label>Address (optional)</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <button type="button" onClick={onBack}>
        Back
      </button>
    </section>
  );
}

export default CitizenRegister;
