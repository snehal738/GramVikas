
import { useEffect, useState } from "react";
import Notices from "./Notices";
import Projects from "./Projects";
import Schemes from "./Schemes";

function AdminPanel() {
  const [section, setSection] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchComplaints = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints"
      );

      if (!response.ok) {
        throw new Error("Unable to load complaints");
      }

      const data = await response.json();

      setComplaints(
        Array.isArray(data) ? data : data.complaints || []
      );
      setMessage("");
    } catch (error) {
      setMessage("Unable to load complaints. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update status.");
        return;
      }

      setMessage("Complaint status updated successfully!");
      await fetchComplaints();
    } catch (error) {
      setMessage("Unable to update status. Check the backend.");
    }
  };

  const deleteComplaint = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the complaint "${title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete complaint.");
        return;
      }

      setMessage("Complaint deleted successfully.");
      await fetchComplaints();
    } catch (error) {
      setMessage("Unable to delete complaint. Check the backend.");
    }
  };

  const total = complaints.length;
  const pending = complaints.filter(
    (item) => item.status === "Pending"
  ).length;
  const inProgress = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;
  const resolved = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const filteredComplaints =
    filter === "All"
      ? complaints
      : complaints.filter((item) => item.status === filter);

  const sections = [
    { name: "Complaints", icon: "📝" },
    { name: "Village Notices", icon: "📢" },
    { name: "Development Projects", icon: "🏗️" },
    { name: "Government Schemes", icon: "🏛️" },
  ];

  return (
    <div className="admin-panel">
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">
            GRAMVIKAS • ADMINISTRATION
          </span>
          <h2>Admin Dashboard</h2>
          <p>Manage village services from one place.</p>
        </div>
      </div>

      <nav className="admin-service-nav" aria-label="Admin services">
        {sections.map((item) => (
          <button
            key={item.name}
            className={
              section === item.name ? "admin-nav-active" : ""
            }
            onClick={() => {
              setSection(item.name);
              setMessage("");
            }}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
        {section === "" && (
  <div className="admin-service-content">
    <h3>Welcome to GramVikas Admin</h3>
    <p>
      Select a service from the menu to manage village complaints,
      notices, development projects, or government schemes.
    </p>
  </div>
)}
      {section === "Complaints" && (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Total Complaints</span>
              <strong>{total}</strong>
            </div>

            <div className="admin-stat pending-stat">
              <span>Pending</span>
              <strong>{pending}</strong>
            </div>

            <div className="admin-stat progress-stat">
              <span>In Progress</span>
              <strong>{inProgress}</strong>
            </div>

            <div className="admin-stat resolved-stat">
              <span>Resolved</span>
              <strong>{resolved}</strong>
            </div>
          </div>

          {message && (
            <div className="admin-message" role="status">
              {message}
            </div>
          )}

          <div className="admin-list-heading">
            <div>
              <h3>Village Complaints</h3>
              <p>Review complaints and update their status.</p>
            </div>

            <select
              aria-label="Filter complaints"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All Complaints</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <button
            className="admin-refresh"
            onClick={fetchComplaints}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh Complaints"}
          </button>

          {loading ? (
            <div className="admin-empty">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="admin-empty">
              No complaints found.
            </div>
          ) : (
            <div className="admin-complaint-list">
              {filteredComplaints.map((complaint) => (
                <article
                  className="admin-complaint"
                  key={complaint._id}
                >
                  <div className="complaint-card-top">
                    <div>
                      <span className="complaint-reference">
                        COMPLAINT
                      </span>
                      <h3>{complaint.title}</h3>
                    </div>

                    <span
                      className={`complaint-status status-${(
                        complaint.status || "Pending"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  <p className="complaint-description">
                    {complaint.description}
                  </p>

                  <div className="complaint-card-bottom">
                    <label htmlFor={`status-${complaint._id}`}>
                      Update status
                    </label>

                    <select
                      id={`status-${complaint._id}`}
                      value={complaint.status}
                      onChange={(event) =>
                        updateStatus(
                          complaint._id,
                          event.target.value
                        )
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>                  
  <button
    type="button"
    className="admin-delete-button"
    onClick={() =>
      deleteComplaint(complaint._id, complaint.title)
    }
  >
    Delete Complaint
  </button>

                </article>
              ))}
            </div>
          )}
        </>
      )}

      {section === "Village Notices" && (
        <div className="admin-service-content">
          <h3>Manage Village Notices</h3>
          <p>Village notices are displayed below.</p>
         <Notices isAdmin={true} />
          <p>
            Add, edit, and delete controls will need to be connected
            to your notice storage before this section can manage notices.
          </p>
        </div>
      )}

      {section === "Development Projects" && (
        <div className="admin-service-content">
          <h3>Manage Development Projects</h3>
          <p>Village development projects are displayed below.</p>
          <Projects isAdmin={true} />
          <p>
            Project creation and progress updates need to be connected
            to the backend before they can be managed here.
          </p>
        </div>
      )}

     
{section === "Government Schemes" && (
  <div className="admin-service-content">
    <h3>Manage Government Schemes</h3>
    <p>Add, edit, and delete government scheme information.</p>
    <Schemes isAdmin={true} />
  </div>
)}

    </div>
  );
}

export default AdminPanel;
