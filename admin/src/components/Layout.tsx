import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'sidebar-link is-active' : 'sidebar-link';
}

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="brand-kicker">Body Nation</p>
          <h1>Admin Control</h1>
          <p className="sidebar-copy">Catalog, orders, and daily operations in one branded workspace.</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={navClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/orders" className={navClassName}>
            Orders
          </NavLink>
          <NavLink to="/products" className={navClassName}>
            Products
          </NavLink>
        </nav>

        <button type="button" className="button button--ghost-light" onClick={logout}>
          Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Operations Center</p>
            <h2>Body Nation Admin Portal</h2>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
