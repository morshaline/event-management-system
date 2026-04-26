import { useState } from "react";

const defaultFormState = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
};

function mapInitialData(initialData) {
  if (!initialData) {
    return defaultFormState;
  }

  return {
    title: initialData.title,
    description: initialData.description,
    location: initialData.location,
    eventDate: initialData.event_date?.slice(0, 10),
  };
}

export default function EventForm({ initialData, onSubmit, onCancel, busy }) {
  const [formData, setFormData] = useState(() => mapInitialData(initialData));
  const isEditMode = Boolean(initialData);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const wasSuccessful = await onSubmit(formData);

    if (!isEditMode && wasSuccessful) {
      setFormData(defaultFormState);
    }
  };

  return (
    <div className="panel">
      <h2>{isEditMode ? "Update Event" : "Create New Event"}</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field">
          <span>Event Title</span>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Web Security Workshop"
            required
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Share event goals, agenda, and expected participants"
            rows={4}
            required
          />
        </label>

        <label className="field">
          <span>Location</span>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="ULAB Permanent Campus, Room 503"
            required
          />
        </label>

        <label className="field">
          <span>Date</span>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? "Saving..." : isEditMode ? "Save Changes" : "Add Event"}
          </button>
          {isEditMode ? (
            <button type="button" className="button button-secondary" onClick={onCancel}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
