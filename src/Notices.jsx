
import { useEffect, useState } from "react";

const API_URL = "/api/notices";

function Notices({ isAdmin = false }) {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => sessionStorage.getItem("adminToken") || "";

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load notices.");
      }

      const data = await response.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Unable to load notices. Check the connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const addNotice = async (event) => {
    event.preventDefault();
    setMessage("");

    const token = getToken();

    if (!isAdmin || !token) {
      setMessage("Please log in as admin to publish notices.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, date }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to publish notice.");
        return;
      }

      setMessage("Notice published successfully!");
      setTitle("");
      setDescription("");
      setDate("");
      await fetchNotices();
    } catch {
      setMessage("Unable to publish notice.");
    }
  };

  const deleteNotice = async (notice) => {
    if (
      !window.confirm(
        `Delete the notice "${notice.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const token = getToken();

    if (!isAdmin || !token) {
      setMessage("Please log in as admin first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${notice._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete notice.");
        return;
      }

      setMessage("Notice deleted successfully.");
      await fetchNotices();
    } catch {
      setMessage("Unable to delete notice.");
    }
  };

  return (
    <div className="notices-page">
      <h2>Village Notices</h2>
      <p>Important announcements for our village.</p>

      {message && <p role="status">{message}</p>}

      {isAdmin && (
        <form onSubmit={addNotice} className="notice-form">
          <h3>Publish a Notice</h3>

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
      )}

      <h3>Latest Notices</h3>

      {loading ? (
        <p>Loading notices...</p>
      ) : notices.length === 0 ? (
        <p>No notices available.</p>
      ) : (
        notices.map((notice) => (
          <article className="notice-card" key={notice._id}>
            <h3>{notice.title}</h3>
            <p>{notice.description}</p>
            <p><strong>Date:</strong> {notice.date}</p>

            {isAdmin && (
              <button
                type="button"
                className="admin-delete-button"
                onClick={() => deleteNotice(notice)}
              >
                Delete Notice
              </button>
            )}
          </article>
        ))
      )}

      <button type="button" onClick={fetchNotices} disabled={loading}>
        Refresh Notices
      </button>
    </div>
  );
}

export default Notices;
