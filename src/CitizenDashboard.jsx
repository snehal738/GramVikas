import ComplaintDB from "./ComplaintDB";
import Notices from "./Notices";
import Projects from "./Projects";
import Schemes from "./Schemes";
import { useState } from "react";

function CitizenDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Home");

  const username = sessionStorage.getItem("citizenUsername") || "Citizen";
  const village = sessionStorage.getItem("citizenVillage") || "Your Village";

  const services = [
    {name: "Home"},
    { name: "My Profile", icon: "👤", description: "Your account details" },
    { name: "Complaints", icon: "📝", description: "Report village problems" },
    { name: "Village Notices", icon: "📢", description: "Read village announcements" },
    { name: "Development Projects", icon: "🏗️", description: "View village development" },
    { name: "Government Schemes", icon: "🏛️", description: "Explore available schemes" },
  ];

  return (
    <div className="citizen-dashboard">
      <header className="citizen-header">
        <div>
          <h1>🌱 GramVikas</h1>
          <p>Digital Development for Our Village</p>
        </div>

        <button onClick={onLogout} className="citizen-logout">
          Logout
        </button>
      </header>

      <div className="citizen-layout">
        <aside className="citizen-sidebar">
          <h3>Citizen Menu</h3>

          {services.map((service) => (
            <button
              key={service.name}
              className={
                activeSection === service.name ? "citizen-menu-active" : ""
              }
              onClick={() => setActiveSection(service.name)}
            >
              <span>{service.icon}</span> {service.name}
            </button>
          ))}
        </aside>

        <main className="citizen-main">
          {activeSection === "Home" && (
  <div className="citizen-welcome">
    <span>GRAMVIKAS CITIZEN PORTAL</span>
    <h2>Welcome, {username}!</h2>
    <p>Village: {village}</p>
    <p>Access village information and services from one place.</p>
  </div>
)}

         {activeSection === "Complaints" && (
  <section className="citizen-content-card">
    <h2>Village Complaints</h2>
    <ComplaintDB />
  </section>
)}
{activeSection === "Village Notices" && (
  <section className="citizen-content-card">
    <Notices />
  </section>
)}
{activeSection === "Development Projects" && (
  <section className="citizen-content-card">
    <Projects />
  </section>
)}
{activeSection === "Government Schemes" && (
  <section className="citizen-content-card">
    <Schemes />
  </section>
)}
{activeSection === "My Profile" && (
  <section className="citizen-content-card">
    <h2>My Profile</h2>
    <p><strong>Username:</strong> {username}</p>
    <p><strong>Village:</strong> {village}</p>
    <p><strong>Account:</strong> Registered</p>
  </section>
)}

{activeSection !== "Home" &&
  activeSection !== "My Profile" &&
  activeSection !== "Complaints" &&
  activeSection !== "Village Notices" &&
  activeSection !== "Development Projects" &&
  activeSection !== "Government Schemes" && (
    <section className="citizen-content-card">
      <h2>{activeSection}</h2>
      <p>We will connect this service next.</p>
    </section>
)}
        </main>
      </div>
    </div>
  );
}

export default CitizenDashboard;
