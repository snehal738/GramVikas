
import { useEffect, useState } from "react";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const fetchNotices = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/notices"
      );

      if (!response.ok) {
        throw new Error("Failed to load notices");
      }

      const data = await response.json();
      setNotices(data);
    } catch (error) {
      setMessage("Unable to load notices. Check the backend.");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const addNotice = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/notices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to publish notice.");
        return;
      }

      setMessage("Notice published and saved to MongoDB!");

      setTitle("");
      setDescription("");
      setDate("");

      await fetchNotices();
    } catch (error) {
      setMessage("Unable to publish notice. Check the backend.");
    }
  };

  return (
    <div className="notices-page">
      <h2>Village Notices</h2>
      <p>Important announcements for our village.</p>

      {message && <p>{message}</p>}

      <form onSubmit={addNotice} className="notice-form">
        <input
          type="text"
          placeholder="Notice title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <textarea
          placeholder="Notice description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <label>Notice date</label>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <button type="submit">Publish Notice</button>
      </form>

      <h3>Latest Notices</h3>

      {notices.length === 0 ? (
        <p>No notices available.</p>
      ) : (
        notices.map((notice) => (
          <div className="notice-card" key={notice._id}>
            <h3>{notice.title}</h3>
            <p>{notice.description}</p>
            <p>
              <strong>Date:</strong> {notice.date}
            </p>
          </div>
        ))
      )}

      <button onClick={fetchNotices}>Refresh Notices</button>
    </div>
  );
}

export default Notices;
