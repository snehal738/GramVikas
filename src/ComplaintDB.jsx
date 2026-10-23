
import { useState } from "react";

export default function ComplaintDB() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function submitComplaint(e) {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setMessage("Complaint saved to MongoDB!");
      setTitle("");
      setDescription("");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  }

  return (
    <section>
      <h3>Submit a Village Complaint</h3>

      <form onSubmit={submitComplaint}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Complaint title"
          required
        />

        <br /><br />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your complaint"
          required
        />

        <br /><br />

        <button type="submit">Submit Complaint</button>
      </form>

      <p>{message}</p>
    </section>
  );
}
