
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/projects";

function Projects({ isAdmin = false }) {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "Planned",
    progress: 0,
  };

  const [form, setForm] = useState(emptyForm);

  const getToken = () =>
    sessionStorage.getItem("adminToken") ||
    sessionStorage.getItem("admin_token");

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load projects");
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        "Could not load projects. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "progress" ? Number(value) : value,
      ...(name === "status" && value === "Completed"
        ? { progress: 100 }
        : {}),
    }));
  };

  const startEditing = (project) => {
    setEditingId(project.id || project._id);

    setForm({
      name: project.name || project.title || "",
      description: project.description || "",
      location: project.location || "",
      startDate: project.startDate
        ? String(project.startDate).slice(0, 10)
        : "",
      endDate: project.endDate
        ? String(project.endDate).slice(0, 10)
        : "",
      status: project.status || "Planned",
      progress: Number(project.progress ?? 0),
    });

    setMessage("Editing project: " + (project.name || project.title));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.name.trim() || !form.description.trim() ||
        !form.location.trim()) {
      setMessage("Enter the project name, description, and location.");
      return;
    }

    if (form.startDate && form.endDate &&
        form.endDate < form.startDate) {
      setMessage("End date cannot be earlier than start date.");
      return;
    }

    const token = getToken();

    if (!token) {
      setMessage("Admin login expired. Please log in again.");
      return;
    }

    const projectData = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      progress: form.status === "Completed" ? 100 : Number(form.progress),
    };

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save project");
      }

      setMessage(
        editingId
          ? "Project updated successfully!"
          : "Project added successfully!"
      );

      resetForm();
      await loadProjects();
    } catch (error) {
      setMessage(error.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm("Delete this project?")) return;

    const token = getToken();

    if (!token) {
      setMessage("Admin login expired. Please log in again.");
      return;
    }

    const id = project.id || project._id;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
      }

      setMessage("Project deleted successfully.");
      await loadProjects();
    } catch (error) {
      setMessage(error.message || "Could not delete project.");
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-heading">
        <div>
          <h2>Village Development Projects</h2>
          <p>Track development activities and project progress.</p>
        </div>

        <span className="projects-count">
          {projects.length} Projects
        </span>
      </div>

      {isAdmin && (
        <section className="project-admin-form">
          <h3>
            {editingId ? "Edit Project" : "Add New Project"}
          </h3>

          <form onSubmit={saveProject}>
            <label>
              Project Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter project name"
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="Describe the project"
                required
              />
            </label>

            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Project location"
                required
              />
            </label>

            <div className="project-form-grid">
              <label>
                Start Date
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={updateField}
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={updateField}
                />
              </label>
            </div>

            <label>
              Project Status
              <select
                name="status"
                value={form.status}
                onChange={updateField}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </label>

            <label>
              Progress: {form.progress}%
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                value={form.progress}
                onChange={updateField}
                disabled={form.status === "Completed"}
              />
            </label>

            <div className="project-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Project"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {message && <p role="status">{message}</p>}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects available yet.</p>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const id = project.id || project._id;
            const name = project.name || project.title || "Untitled Project";
            const progress = Number(project.progress ?? 0);

            return (
              <article className="project-card" key={id}>
                <div className="project-card-heading">
                  <h3>{name}</h3>
                  <span
                    className={`project-status status-${(
                      project.status || "Planned"
                    ).toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {project.status || "Planned"}
                  </span>
                </div>

                <p>{project.description}</p>

                {project.location && (
                  <p>
                    <strong>Location:</strong> {project.location}
                  </p>
                )}

                <div className="project-dates">
                  {project.startDate && (
                    <p>
                      <strong>Start:</strong>{" "}
                      {String(project.startDate).slice(0, 10)}
                    </p>
                  )}
                  {project.endDate && (
                    <p>
                      <strong>Expected completion:</strong>{" "}
                      {String(project.endDate).slice(0, 10)}
                    </p>
                  )}
                </div>

                <div className="project-progress-label">
                  <strong>Project Progress</strong>
                  <strong>{progress}%</strong>
                </div>

                <div
                  className="progress-bar"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${name} progress`}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {isAdmin && (
                  <div className="project-card-actions">
                    <button
                      type="button"
                      onClick={() => startEditing(project)}
                    >
                      Edit Project
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProject(project)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;
