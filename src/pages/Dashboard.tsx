import { useStore } from '../lib/store';
import './Dashboard.css';

export function Dashboard() {
    const { profile, obligations, deadlines, alerts } = useStore();

    // Count by type
    const gstCount = obligations.filter(o => o.type === 'GST').length;
    const itCount = obligations.filter(o => o.type === 'INCOME_TAX').length;
    const tdsCount = obligations.filter(o => o.type === 'TDS').length;

    // Next deadline
    const nextDeadline = deadlines.find(d => d.status !== 'completed');

    // Critical alerts
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');

    return (
        <div className="container">
            <div className="dashboard">
                {/* Welcome Section */}
                <header className="dashboard-header animate-slide-up">
                    <h1>Welcome back, {profile?.ownerName?.split(' ')[0]}! 👋</h1>
                    <p>Here's your compliance overview for {profile?.name}</p>
                </header>

                {/* Alert Banner - Critical */}
                {criticalAlerts.length > 0 && (
                    <div className="alert alert-critical animate-fade-in">
                        <span className="alert-icon">🚨</span>
                        <div className="alert-content">
                            <strong>{criticalAlerts[0].title}</strong>
                            <p>{criticalAlerts[0].message}</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon gst">📋</div>
                        <div className="stat-info">
                            <span className="stat-value">{gstCount}</span>
                            <span className="stat-label">GST Obligations</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon it">💰</div>
                        <div className="stat-info">
                            <span className="stat-value">{itCount}</span>
                            <span className="stat-label">Income Tax</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon tds">📊</div>
                        <div className="stat-info">
                            <span className="stat-value">{tdsCount}</span>
                            <span className="stat-label">TDS Obligations</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon alerts">⚠️</div>
                        <div className="stat-info">
                            <span className="stat-value">{criticalAlerts.length + warningAlerts.length}</span>
                            <span className="stat-label">Active Alerts</span>
                        </div>
                    </div>
                </div>

                {/* Next Deadline */}
                {nextDeadline && (
                    <div className="card next-deadline">
                        <div className="card-header">
                            <h3>⏳ Next Deadline</h3>
                            <span className={`badge badge-${nextDeadline.status === 'due_soon' ? 'warning' : 'info'}`}>
                                {nextDeadline.daysRemaining} days left
                            </span>
                        </div>
                        <div className="deadline-details">
                            <h4>{nextDeadline.obligationName}</h4>
                            <p>{nextDeadline.description}</p>
                            <p className="deadline-date">
                                Due: {nextDeadline.dueDate.toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Obligations List */}
                <div className="card obligations-card">
                    <div className="card-header">
                        <h3>📑 Your Compliance Obligations</h3>
                    </div>
                    <div className="obligations-list">
                        {obligations.map(obligation => (
                            <div key={obligation.id} className="obligation-item">
                                <div className="obligation-type">
                                    <span className={`badge badge-${obligation.type === 'GST' ? 'success' : obligation.type === 'INCOME_TAX' ? 'primary' : 'warning'}`}>
                                        {obligation.type}
                                    </span>
                                </div>
                                <div className="obligation-info">
                                    <strong>{obligation.name}</strong>
                                    <p>{obligation.description}</p>
                                </div>
                                <div className="obligation-frequency">
                                    {obligation.frequency}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
