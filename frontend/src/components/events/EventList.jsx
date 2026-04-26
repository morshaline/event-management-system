import EventCard from "./EventCard";

export default function EventList({ events, emptyMessage, renderActions }) {
  if (!events.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id || event.event_id} event={event}>
          {renderActions ? renderActions(event) : null}
        </EventCard>
      ))}
    </div>
  );
}
