import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('The admin email or password did not match.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">Body Nation Admin</p>
        <h1>Launch the control room</h1>
        <p className="muted">Sign in with the env-configured admin credentials to manage products and fulfillment.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="error-copy">{error}</p> : null}
          <button className="button button--primary button--block" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Enter Admin'}
          </button>
        </form>
      </section>
    </main>
  );
}
