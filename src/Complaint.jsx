
import { useState } from "react";

export default function Complaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  function submitComplaint(e) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    const complaints = JSON.parse(
      localStorage.getItem("complaints") || "[]"
    );

    complaints.push({
      id: Date.now(),
      title,
      description,
      date: new Date().toLocaleString(),
      status: "Pending",
    });

    localStorage.setItem(
      "complaints",
      JSON.stringify(complaints)
    );

    setTitle("");
    setDescription("");
    setMessage("Complaint submitted successfully!");

  }

  return (
    <section>
      <h3>Submit a Village Complaint</h3>

      <form onSubmit={submitComplaint}>
        <input
          type="text"
          placeholder="Complaint title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <br /><br />

        <textarea
          placeholder="Describe your complaint"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Submit Complaint</button>
      </form>

      <p>{message}</p>
    </section>
  );
}
