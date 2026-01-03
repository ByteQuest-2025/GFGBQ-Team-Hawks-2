import { NavLink } from 'react-router-dom';
import { useStore } from '../lib/store';
import './Navbar.css';

export function Navbar() {
    const { profile, alerts, clearProfile } = useStore();
    const criticalCount = alerts.filter(a => a.level === 'critical').length;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-brand">
                    <span className="navbar-logo">🛡️</span>
                    <span className="navbar-title">TaxCopilot</span>
                </div>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Calendar
                    </NavLink>
                    <NavLink to="/copilot" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Copilot
                        {criticalCount > 0 && (
                            <span className="alert-badge">{criticalCount}</span>
                        )}
                    </NavLink>
                </div>

                {/* Profile Section */}
                <div className="navbar-profile">
                    <div className="profile-info">
                        <span className="profile-name">{profile?.ownerName}</span>
                        <span className="profile-business">{profile?.name}</span>
                    </div>
                    <button className="btn btn-ghost" onClick={clearProfile} title="Logout">
                        ↩️
                    </button>
                </div>
            </div>
        </nav>
    );
}
