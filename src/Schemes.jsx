
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/schemes";

function Schemes({ isAdmin = false }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    schemeName: "",
    category: "",
    description: "",
    benefits: "",
    eligibility: "",
    requiredDocuments: "",
    applicationLink: "",
    department: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadSchemes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load government schemes.");
      }

      const data = await response.json();
      setSchemes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemes();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function getToken() {
    return (
      sessionStorage.getItem("adminToken") ||
      sessionStorage.getItem("admin_token") ||
      ""
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const token = getToken();

    if (!token) {
      setError("Please log in as admin before managing schemes.");
      return;
    }

    const payload = {
      ...form,
      schemeName: form.schemeName.trim(),
      description: form.description.trim(),
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save scheme.");
      }

      setMessage(result.message || "Scheme saved successfully.");
      setForm(emptyForm);
      setEditingId(null);
      await loadSchemes();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(scheme) {
    setEditingId(scheme._id);

    setForm({
      schemeName: scheme.schemeName || scheme.name || "",
      category: scheme.category || "",
      description: scheme.description || scheme.benefits || "",
      benefits: scheme.benefits || "",
      eligibility: scheme.eligibility || "",
      requiredDocuments: scheme.requiredDocuments || "",
      applicationLink: scheme.applicationLink || scheme.link || "",
      department: scheme.department || "",
      status: scheme.status || "Active",
    });

    setMessage("");
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this scheme?")) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please log in as admin first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete scheme.");
      }

      setMessage(result.message || "Scheme deleted successfully.");
      await loadSchemes();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="schemes-page">
      <h2>Government Schemes</h2>

      <p>
        Explore government schemes and visit official portals for
        eligibility and application information.
      </p>

      {isAdmin && (
        <section className="scheme-admin-form">
          <h3>{editingId ? "Edit Scheme" : "Add Government Scheme"}</h3>

          <form onSubmit={handleSubmit}>
            <label>
              Scheme Name *
              <input
                name="schemeName"
                value={form.schemeName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Farmers, Healthcare, Housing..."
              />
            </label>

            <label>
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Benefits
              <textarea
                name="benefits"
                value={form.benefits}
                onChange={handleChange}
              />
            </label>

            <label>
              Eligibility
              <textarea
                name="eligibility"
                value={form.eligibility}
                onChange={handleChange}
              />
            </label>

            <label>
              Required Documents
              <textarea
                name="requiredDocuments"
                value={form.requiredDocuments}
                onChange={handleChange}
                placeholder="List required documents"
              />
            </label>

            <label>
              Official Application Website
              <input
                type="url"
                name="applicationLink"
                value={form.applicationLink}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label>
              Department
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </label>

            <button type="submit">
              {editingId ? "Update Scheme" : "Add Scheme"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>
      )}

      {loading && <p>Loading government schemes...</p>}

      {error && <p role="alert">{error}</p>}
      {message && <p>{message}</p>}

      {!loading && !error && schemes.length === 0 && (
        <p>No schemes have been added yet.</p>
      )}

      <div className="schemes-grid">
        {schemes.map((scheme) => (
          <article className="scheme-card" key={scheme._id}>
            <h3>{scheme.schemeName || scheme.name}</h3>

            {(scheme.category || scheme.department) && (
              <p>
                <strong>Category / Department:</strong>{" "}
                {scheme.category || scheme.department}
              </p>
            )}

            {scheme.description && (
              <p>
                <strong>Description:</strong> {scheme.description}
              </p>
            )}

            {scheme.benefits && (
              <p>
                <strong>Benefits:</strong> {scheme.benefits}
              </p>
            )}

            {scheme.eligibility && (
              <p>
                <strong>Eligibility:</strong> {scheme.eligibility}
              </p>
            )}

            {scheme.requiredDocuments && (
              <p>
                <strong>Required Documents:</strong>{" "}
                {Array.isArray(scheme.requiredDocuments)
                  ? scheme.requiredDocuments.join(", ")
                  : scheme.requiredDocuments}
              </p>
            )}

            {scheme.status && <p>Status: {scheme.status}</p>}

            {(scheme.applicationLink || scheme.link) && (
              <a
                href={scheme.applicationLink || scheme.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Official Website ↗
              </a>
            )}

            {isAdmin && (
              <div>
                <button onClick={() => handleEdit(scheme)}>Edit</button>
                <button onClick={() => handleDelete(scheme._id)}>
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <p className="scheme-note">
        Scheme benefits and eligibility may change. Verify the latest
        information on the official government website before applying.
      </p>
    </div>
  );
}

export default Schemes;
