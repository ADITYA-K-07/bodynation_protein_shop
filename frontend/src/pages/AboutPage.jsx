export default function AboutPage() {
  return (
    <div className="shell">
      <section className="section-intro">
        <p className="eyebrow">About us</p>
        <h1>Performance Nutrition, Built on Trust</h1>
        <p className="muted">This page introduces the brand while leaving room for future CMS or admin-managed content.</p>
      </section>

      <section className="about-grid">
        <article className="info-card">
          <p className="eyebrow">Our angle</p>
          <h2>Body Nation is designed as an authenticity-first supplement storefront.</h2>
          <p>
            The frontend highlights verified brands, category-led shopping, and clear paths into products,
            cart, and payment. It is intentionally structured so backend data can replace the seed content
            without forcing a redesign.
          </p>
        </article>
        <article className="info-card" id="lab-reports">
          <p className="eyebrow">Lab reports</p>
          <h2>Ready for trust content</h2>
          <p>
            Product detail pages already expose a lab report panel. Once files are available, those links can
            point to uploaded PDFs or cloud storage objects.
          </p>
          <div className="pill-row">
            <span className="pill">Verified brands</span>
            <span className="pill">Report upload ready</span>
            <span className="pill">Admin panel friendly</span>
          </div>
        </article>
      </section>
    </div>
  );
}
