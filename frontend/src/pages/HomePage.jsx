import { Link } from "react-router-dom";
import SectionHeader from "../components/common/SectionHeader";

const features = [
  {
    title: "Dual Role Access",
    description:
      "Organizers can create and manage events while participants can discover and register in real time.",
  },
  {
    title: "Smart Event Dashboard",
    description:
      "Track registrations, edit event details, and handle updates from one clean workspace.",
  },
  {
    title: "Secure and Scalable",
    description:
      "Password hashing, API validation, and MySQL schema design built for practical deployment.",
  },
];

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <SectionHeader
          eyebrow="CSE 3120 Open-Ended Project"
          title="Event Management System for Modern Campus and Professional Activities"
          subtitle="Plan seminars, run workshops, and manage participants through a role-aware web platform."
        />

        <div className="hero-actions reveal">
          <Link to="/register" className="button button-primary">
            Get Started
          </Link>
          <Link to="/events" className="button button-secondary">
            Explore Events
          </Link>
        </div>
      </section>

      <section className="panel feature-panel">
        <h2>Why This Project Stands Out</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article key={feature.title} className="feature-card" style={{ animationDelay: `${index * 120}ms` }}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
