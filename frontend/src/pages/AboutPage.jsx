import SectionHeader from "../components/common/SectionHeader";

const stack = [
  "React + Vite frontend with route-based multipage navigation",
  "Express.js REST API with role-based authorization logic",
  "MySQL relational schema for users, events, and registrations",
  "Responsive design tokens and reusable component architecture",
];

export default function AboutPage() {
  return (
    <div className="page">
      <SectionHeader
        eyebrow="Project Overview"
        title="About the EventFlow Pro Platform"
        subtitle="This system solves a real-world need for streamlined event publishing and registration management."
      />

      <section className="panel">
        <h2>Implementation Highlights</h2>
        <ul className="clean-list">
          {stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Academic Relevance</h2>
        <p>
          The project demonstrates full-stack web engineering, database normalization,
          authentication patterns, and ethical design concerns including privacy,
          inclusiveness, and secure credential handling.
        </p>
      </section>
    </div>
  );
}
