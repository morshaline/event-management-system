import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page narrow-page">
      <section className="panel text-center reveal">
        <p className="eyebrow">404</p>
        <h1>Page Not Found</h1>
        <p className="muted">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="button button-primary">
          Back to Home
        </Link>
      </section>
    </div>
  );
}
