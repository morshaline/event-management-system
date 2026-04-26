import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventList from "../components/events/EventList";
import SectionHeader from "../components/common/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { eventService } from "../services/eventService";

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const participantId = user?.role === "participant" ? user.id : undefined;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await eventService.listEvents(participantId);
      setEvents(Array.isArray(response) ? response : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRegister = async (eventId) => {
    setError("");
    setMessage("");

    if (!user) {
      navigate("/login", { state: { from: "/events" } });
      return;
    }

    if (user.role !== "participant") {
      setError("Only participants can register for events.");
      return;
    }

    try {
      await eventService.registerForEvent(eventId, user.id);
      setMessage("Registration completed successfully.");
      await loadEvents();
    } catch (registerError) {
      setError(registerError.message);
    }
  };

  const handleUnregister = async (eventId) => {
    setError("");
    setMessage("");

    try {
      await eventService.unregisterFromEvent(eventId, user.id);
      setMessage("Registration removed.");
      await loadEvents();
    } catch (unregisterError) {
      setError(unregisterError.message);
    }
  };

  return (
    <div className="page">
      <SectionHeader
        eyebrow="Open Events"
        title="Browse and Join Upcoming Events"
        subtitle="Organizers publish professional events while participants can register instantly."
      />

      {message ? <p className="alert alert-success">{message}</p> : null}
      {error ? <p className="alert alert-error">{error}</p> : null}

      {loading ? (
        <p className="empty-state">Loading events...</p>
      ) : (
        <EventList
          events={events}
          emptyMessage="No events are available yet."
          renderActions={(event) => {
            if (!user) {
              return (
                <button type="button" className="button button-primary" onClick={() => navigate("/login") }>
                  Login to Register
                </button>
              );
            }

            if (user.role !== "participant") {
              return <p className="muted">Organizer accounts cannot register as participants.</p>;
            }

            const isRegistered = Boolean(Number(event.is_registered));

            return isRegistered ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleUnregister(event.id)}
              >
                Cancel Registration
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary"
                onClick={() => handleRegister(event.id)}
              >
                Register Now
              </button>
            );
          }}
        />
      )}
    </div>
  );
}
