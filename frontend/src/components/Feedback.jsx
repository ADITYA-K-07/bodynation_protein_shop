import { Link } from "react-router-dom";

export function EmptyState({ title, copy, href, label }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">Body Nation</p>
      <h2>{title}</h2>
      <p>{copy}</p>
      <Link className="button button--primary" to={href}>{label}</Link>
    </div>
  );
}

export function IntegrationNote({ title, copy, variant = "info" }) {
  return (
    <div className={`integration-note integration-note--${variant}`}>
      <p className="integration-note__title">{title}</p>
      <p>{copy}</p>
    </div>
  );
}

export function LoadingState({ title = "Loading storefront..." }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">Body Nation</p>
      <h2>{title}</h2>
      <p>The React storefront is preparing the latest catalog and interface state.</p>
    </div>
  );
}
