export default function ContactPage() {
  return (
    <div className="shell">
      <section className="section-intro">
        <p className="eyebrow">Need help?</p>
        <h1>Contact and Bulk Orders</h1>
        <p className="muted">This page is ready for lead capture, owner notification, or CRM integration later.</p>
      </section>

      <section className="contact-grid">
        <article className="contact-card">
          <p className="eyebrow">Reach us</p>
          <h3>Support</h3>
          <p>Email: support@bodynation.in</p>
          <p>Phone: +91 00000 00000</p>
          <p>Hours: Mon to Sat, 10 AM to 7 PM</p>
        </article>
        <article className="contact-card" id="bulk-orders">
          <p className="eyebrow">Bulk orders</p>
          <h3>Gym and coach enquiries</h3>
          <p>
            Bulk order handling can later connect to Nodemailer, WhatsApp notifications, or a CRM inbox.
          </p>
          <form className="checkout-form">
            <label className="field">
              <span>Name</span>
              <input type="text" placeholder="Your name" />
            </label>
            <label className="field">
              <span>Business</span>
              <input type="text" placeholder="Gym, store, coach name" />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="Email address" />
            </label>
            <label className="field">
              <span>Requirement</span>
              <textarea placeholder="Tell us what products or volumes you need" />
            </label>
            <button className="button button--primary" type="button">Enquiry UI Ready</button>
          </form>
        </article>
      </section>
    </div>
  );
}
