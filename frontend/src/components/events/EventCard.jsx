export default function EventCard({ event, children }) {
  return (
    <article className="event-card reveal">
      <div className="event-card-head">
        <h3>{event.title}</h3>
        <p className="pill">{new Date(event.event_date).toLocaleDateString("en-GB")}</p>
      </div>

      <p className="event-meta">{event.location}</p>
      <p className="event-description">{event.description}</p>

      <div className="event-foot">
        <p>
          Organizer: <strong>{event.organizer_name || "Unknown"}</strong>
        </p>
        <p>
          Registered: <strong>{event.registration_count || 0}</strong>
        </p>
      </div>

      {children ? <div className="event-actions">{children}</div> : null}
    </article>
  );
}
