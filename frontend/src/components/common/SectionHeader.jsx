export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="section-header reveal">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </div>
  );
}
