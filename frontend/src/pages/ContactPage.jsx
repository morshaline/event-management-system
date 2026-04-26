import { useState } from "react";
import SectionHeader from "../components/common/SectionHeader";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page">
      <SectionHeader
        eyebrow="Contact"
        title="Need Collaboration or Support?"
        subtitle="Use this form to send project feedback or event-management related questions."
      />

      <section className="panel">
        {submitted ? (
          <p className="alert alert-success">
            Thanks for your message. This demo uses a local form handler, so data is not persisted.
          </p>
        ) : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input type="text" placeholder="Your full name" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" required />
          </label>

          <label className="field">
            <span>Subject</span>
            <input type="text" placeholder="How can we help?" required />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea rows={4} placeholder="Write your message" required />
          </label>

          <button type="submit" className="button button-primary">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
