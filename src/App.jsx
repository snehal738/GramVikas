
import CitizenDashboard from "./CitizenDashboard";
import CitizenRegister from "./CitizenRegister";
import CitizenLogin from "./CitizenLogin";
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
  
</nav>
          </>
        )}

{/* About Page */}
{page === "About" && (
  <section className="info-page">
    <h2>About GramVikas</h2>

    <p>
      GramVikas is a digital village development platform
      designed to connect villagers with local information
      and public services.
    </p>

    <h3>Our Purpose</h3>
    <p>
      To make village information more accessible and
      support transparent village development.
    </p>

    <h3>Our Services</h3>
    <p>
      Citizens can explore village notices, development
      projects, government schemes, and complaint services.
    </p>
  </section>
)}

{/* Contact Page */}
{page === "Contact" && (
  <section className="info-page">
    <h2>Contact GramVikas</h2>

    <p>
      Have a question about village services or development?
    </p>

    <h3>Contact Your Village Administration</h3>

    <p>
      Please contact your local village administration
      for assistance with village services.
    </p>

    <p>
      For technical issues with this platform, contact
      the GramVikas project administrator.
    </p>
  </section>
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
            

<>
  <section className="modern-hero">
    <div className="hero-content">
      <span className="hero-badge">
        DIGITAL VILLAGE PLATFORM
      </span>

      <h2>Growing Together, Building Tomorrow</h2>

      <p className="hero-subtitle">
        Welcome to GramVikas
      </p>

      <p className="hero-description">
        Your village, your voice, your development.
        Access village services, discover development projects,
        and stay connected with your community.
      </p>
    </div>

    <div className="hero-decoration" aria-hidden="true">
      <div className="sun-circle"></div>
      <div className="field field-one"></div>
      <div className="field field-two"></div>
    </div>
  </section>

  <section className="modern-services">
    <div className="section-heading">
      <span>GET STARTED</span>
      <h2>How can we help you?</h2>
      <p>Choose an option to access GramVikas services.</p>
    </div>

    <div className="modern-service-grid">
      <button
        className="modern-service-card"
        onClick={() => setPage("Admin Login")}
      >
        <span className="modern-service-icon admin-icon">
          🛡️
        </span>
        <h3>Admin Login</h3>
      </button>

      <button
        className="modern-service-card"
        onClick={() => setPage("Citizen Registration")}
      >
        <span className="modern-service-icon register-icon">
          👥
        </span>
        <h3>Citizen Registration</h3>
      
      </button>

      <button
        className="modern-service-card"
        onClick={() => setPage("Citizen Login")}
      >
        <span className="modern-service-icon citizen-icon">
          🏡
        </span>
        <h3>Citizen Login</h3>
        
      </button>
    </div>
  </section>

  <section className="modern-information">
    <div className="modern-info-card about-card">
      <span className="info-label">OUR MISSION</span>
      <h2>About GramVikas</h2>
      <p>
        GramVikas is a digital village development platform
        designed to connect citizens with village information,
        public services, development projects and government schemes.
      </p>
      <p>
        Our goal is to make information easier to access and
        support transparent village development.
      </p>
    </div>

    <div className="modern-info-card contact-card">
      <span className="info-label">WE ARE HERE TO HELP</span>
      <h2>Contact Information</h2>
      <p>
        Need help with village services? Contact your local
        village administration.
      </p>
      <p>
        For technical issues with this platform, contact
        the GramVikas project administrator.
      </p>
    </div>
  </section>
</>

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
            {/* Citizen Registration */}
{page === "Citizen Registration" && (
  <CitizenRegister
    onBack={() => setPage("Home")}
  />
)}

{/* Citizen Login */}
{page === "Citizen Login" && (
  <CitizenLogin
    onBack={() => setPage("Home")}
    onLogin={() => {
      setPage("Citizen Dashboard");
    }}
  />
)}

{/* Citizen Dashboard */}
{page === "Citizen Dashboard" && sessionStorage.getItem("citizenToken") && (
  <CitizenDashboard
    onLogout={() => {
      sessionStorage.removeItem("citizenToken");
      sessionStorage.removeItem("citizenUsername");
      sessionStorage.removeItem("citizenVillage");
      setPage("Citizen Login");
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
