import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventForm from "../components/events/EventForm";
import EventList from "../components/events/EventList";
import SectionHeader from "../components/common/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { eventService } from "../services/eventService";

export default function DashboardPage() {
  const { user, isOrganizer, isParticipant } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrganizerEvents = useCallback(async () => {
    const response = await eventService.listOrganizerEvents(user.id);
    setEvents(Array.isArray(response) ? response : []);
  }, [user.id]);

  const loadParticipantRegistrations = useCallback(async () => {
    const response = await eventService.listParticipantRegistrations(user.id);
    setRegistrations(Array.isArray(response) ? response : []);
  }, [user.id]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (isOrganizer) {
        await loadOrganizerEvents();
      }

      if (isParticipant) {
        await loadParticipantRegistrations();
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [isOrganizer, isParticipant, loadOrganizerEvents, loadParticipantRegistrations]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSaveEvent = async (formData) => {
    setBusy(true);
    setError("");
    setMessage("");

    const payload = {
      organizerId: user.id,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      eventDate: formData.eventDate,
    };

    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
        setMessage("Event updated successfully.");
      } else {
        await eventService.createEvent(payload);
        setMessage("Event created successfully.");
      }

      setEditingEvent(null);
      setFormNonce((value) => value + 1);
      await loadOrganizerEvents();
      return true;
    } catch (saveError) {
      setError(saveError.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this event?");

    if (!shouldDelete) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await eventService.deleteEvent(eventId, user.id);
      setMessage("Event deleted.");
      await loadOrganizerEvents();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUnregister = async (eventId) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await eventService.unregisterFromEvent(eventId, user.id);
      setMessage("Registration removed.");
      await loadParticipantRegistrations();
    } catch (unregisterError) {
      setError(unregisterError.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <SectionHeader
          eyebrow="Dashboard"
          title="Preparing your workspace"
          subtitle="Loading your account data and event summary."
        />
        <p className="empty-state">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <SectionHeader
        eyebrow="Dashboard"
        title={`Welcome, ${user.name}`}
        subtitle={
          isOrganizer
            ? "Manage your published events and attendee engagement."
            : "Track your registered events and upcoming sessions."
        }
      />

      {message ? <p className="alert alert-success">{message}</p> : null}
      {error ? <p className="alert alert-error">{error}</p> : null}

      {isOrganizer ? (
        <>
          <EventForm
            key={`${editingEvent?.id || "new"}-${formNonce}`}
            initialData={editingEvent}
            onSubmit={handleSaveEvent}
            onCancel={() => {
              setEditingEvent(null);
              setFormNonce((value) => value + 1);
            }}
            busy={busy}
          />

          <section className="panel">
            <h2>Your Published Events</h2>
            <EventList
              events={events}
              emptyMessage="You have not created any events yet."
              renderActions={(event) => (
                <>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setEditingEvent(event)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </>
              )}
            />
          </section>
        </>
      ) : null}

      {isParticipant ? (
        <section className="panel">
          <h2>Your Registered Events</h2>
          <p className="muted">
            Want to join more events? <Link to="/events">Browse available events.</Link>
          </p>

          <EventList
            events={registrations}
            emptyMessage="You are not registered for any event yet."
            renderActions={(event) => (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleUnregister(event.event_id || event.id)}
                disabled={busy}
              >
                Unregister
              </button>
            )}
          />
        </section>
      ) : null}
    </div>
  );
}
