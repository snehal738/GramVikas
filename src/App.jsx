
import Schemes from "./Schemes";
import AdminLogin from "./AdminLogin";
import Projects from "./Projects";
import Notices from "./Notices";
import AdminPanel from "./AdminPanel";
import ComplaintDB from "./ComplaintDB";
import ComplaintList from "./ComplaintList";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("Home");

  const [adminUsername, setAdminUsername] = useState(
    sessionStorage.getItem("adminUsername") || ""
  );

  const [complaints, setComplaints] = useState([]);

  // Load complaints from the backend
  useEffect(() => {
    const loadComplaints = async () => {
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
      } catch (error) {
        console.error("Error loading complaints:", error);
      }
    };

    loadComplaints();
  }, [page]);

  // Complaint statistics
  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  // Admin logout
  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUsername");

    setAdminUsername("");
    setPage("Home");
  };

  // Public services
  const services = [
    "Village Complaints",
    "Village Notices",
    "Development Projects",
    "Government Schemes",
  ];

  return (
    <div className="app">
      <header>
        {page === "Home" && (
  <>
    <h1>GramVikas</h1>
    <p>Digital Development for Our Village</p>
  </>
)}
        {page === "Home" && (
          <>
           <nav className="header-navigation">
  <button onClick={() => setPage("Home")}>
    Home
  </button>

  <button onClick={() => setPage("Admin Login")}>
    Admin Login
  </button>
</nav>
          </>
        )}

        {adminUsername && (
          <div>
            <p>Logged in as: {adminUsername}</p>

            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main>
        {page === "Home" ? (
          <>
            <h2>Welcome to GramVikas</h2>

            <p>
              Connecting villagers with local services,
              village updates, and development projects.
            </p>

            {/* Complaint Dashboard */}
            <section className="dashboard">
              <h2>Village Complaint Dashboard</h2>

              <div className="dashboard-grid">
                <div className="stat-card">
                  <h3>Total Complaints</h3>
                  <p>{totalComplaints}</p>
                </div>

                <div className="stat-card">
                  <h3>Pending</h3>
                  <p>{pendingComplaints}</p>
                </div>

                <div className="stat-card">
                  <h3>In Progress</h3>
                  <p>{inProgressComplaints}</p>
                </div>

                <div className="stat-card">
                  <h3>Resolved</h3>
                  <p>{resolvedComplaints}</p>
                </div>
              </div>
            </section>

            {/* Village Overview */}
            <section className="village-overview">
              <h2>Village Overview</h2>

              <p>
                Welcome to GramVikas, a digital platform for
                village services, public complaints, notices,
                and development.
              </p>

              <div className="overview-grid">
                <div className="overview-card">
                  <h3>📢 Village Notices</h3>
                  <p>
                    Stay updated with important village announcements.
                  </p>
                  <button
                    onClick={() => setPage("Village Notices")}
                  >
                    View Notices
                  </button>
                </div>

                <div className="overview-card">
                  <h3>🏗️ Development Projects</h3>
                  <p>
                    Explore village development projects and their progress.
                  </p>
                  <button
                    onClick={() => setPage("Development Projects")}
                  >
                    View Projects
                  </button>
                </div>

                <div className="overview-card">
                  <h3>🏛️ Government Schemes</h3>
                  <p>
                    Discover government schemes and available information.
                  </p>
                  <button
                    onClick={() => setPage("Government Schemes")}
                  >
                    View Schemes
                  </button>
                </div>

                <div className="overview-card">
                  <h3>📝 Public Complaints</h3>
                  <p>
                    Submit a complaint or check existing complaints.
                  </p>
                  <button
                    onClick={() => setPage("Village Complaints")}
                  >
                    Manage Complaints
                  </button>
                </div>
              </div>
            </section>

            {/* Public Services */}
            <h3>Our Services</h3>

            <div className="services">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setPage(service)}
                >
                  {service}
                </button>
              ))}

              <button
                onClick={() => setPage("View Complaints")}
              >
                View Complaints
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{page}</h2>

            {/* Admin Login */}
            {page === "Admin Login" && (
              <AdminLogin
                onLogin={(username) => {
                  sessionStorage.setItem(
                    "adminUsername",
                    username
                  );

                  setAdminUsername(username);
                  setPage("Admin Panel");
                }}
              />
            )}

            {/* Complaints */}
            {page === "Village Complaints" && (
              <>
                <ComplaintDB />            
              </>
            )}

            {page === "View Complaints" && (
              <ComplaintList />
            )}

            {/* Other Public Pages */}
            {page === "Village Notices" && <Notices />}

            {page === "Development Projects" && <Projects />}

            {page === "Government Schemes" && <Schemes />}

           {/* Admin Panel: Manage All Services */}
{page === "Admin Panel" && adminUsername && (
  <AdminPanel />
)}
            <button onClick={() => setPage("Home")}>
              Back to Home
            </button>
          </>
        )}
      </main>

      <footer>
        <p>GramVikas © 2026 | Village Development</p>
      </footer>
    </div>
  );
}

export default App;
