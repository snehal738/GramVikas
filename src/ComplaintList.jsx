
import { useEffect, useState } from "react";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("Loading complaints...");

  async function loadComplaints() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints"
      );

      if (!response.ok) {
        throw new Error("Failed to load complaints");
      }

      const data = await response.json();
      setComplaints(data);
      setMessage(
        data.length === 0 ? "No complaints found." : ""
      );
    } catch (error) {
      setMessage("Could not load complaints.");
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <section>
      <h3>Village Complaints</h3>

      <button onClick={loadComplaints}>
        Refresh Complaints
      </button>

      <p>{message}</p>

      {complaints.map((complaint) => (
        <article
          key={complaint._id}
          style={{
            background: "#fff",
            padding: "15px",
            margin: "15px 0",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <h4>{complaint.title}</h4>
          <p>{complaint.description}</p>
          <p>
            <strong>Status:</strong> {complaint.status}
          </p>
          <small>
            {new Date(complaint.createdAt).toLocaleString()}
          </small>
        </article>
      ))}
    </section>
  );
}
