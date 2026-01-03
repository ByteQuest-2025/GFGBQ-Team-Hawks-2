import { useState } from 'react';
import { useStore } from '../lib/store';
import type { DeadlineStatus } from '../types';
import './Calendar.css';

export function Calendar() {
    const { deadlines, markDeadlineComplete } = useStore();
    const [filter, setFilter] = useState<'all' | 'overdue' | 'due_soon' | 'upcoming'>('all');

    // Filter deadlines
    const filteredDeadlines = deadlines.filter(d => {
        if (d.status === 'completed') return false;
        if (filter === 'all') return true;
        return d.status === filter;
    });

    // Group by month
    const groupedDeadlines = filteredDeadlines.reduce((acc, deadline) => {
        const monthKey = deadline.dueDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(deadline);
        return acc;
    }, {} as Record<string, typeof deadlines>);

    const getStatusColor = (status: DeadlineStatus) => {
        switch (status) {
            case 'overdue': return 'danger';
            case 'due_soon': return 'warning';
            default: return 'success';
        }
    };

    return (
        <div className="container">
            <div className="calendar-page">
                {/* Header */}
                <header className="calendar-header animate-slide-up">
                    <div>
                        <h1>📅 Compliance Calendar</h1>
                        <p>Track all your upcoming tax deadlines</p>
                    </div>

                    {/* Filters */}
                    <div className="filter-buttons">
                        <button
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('overdue')}
                        >
                            🔴 Overdue
                        </button>
                        <button
                            className={`btn ${filter === 'due_soon' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('due_soon')}
                        >
                            🟡 Due Soon
                        </button>
                        <button
                            className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            🟢 Upcoming
                        </button>
                    </div>
                </header>

                {/* Deadline Groups */}
                <div className="deadline-groups">
                    {Object.entries(groupedDeadlines).map(([month, monthDeadlines]) => (
                        <div key={month} className="deadline-group animate-fade-in">
                            <h2 className="month-header">{month}</h2>

                            <div className="deadline-list">
                                {monthDeadlines.map(deadline => (
                                    <div key={deadline.id} className={`deadline-card status-${deadline.status}`}>
                                        <div className="deadline-date-box">
                                            <span className="date-day">
                                                {deadline.dueDate.getDate()}
                                            </span>
                                            <span className="date-month">
                                                {deadline.dueDate.toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="deadline-info">
                                            <div className="deadline-header">
                                                <h3>{deadline.obligationName}</h3>
                                                <span className={`badge badge-${getStatusColor(deadline.status)}`}>
                                                    {deadline.status === 'overdue'
                                                        ? `${Math.abs(deadline.daysRemaining)} days overdue`
                                                        : `${deadline.daysRemaining} days left`
                                                    }
                                                </span>
                                            </div>
                                            <p>{deadline.description}</p>
                                            {deadline.penalty && (
                                                <p className="penalty-info">⚠️ Penalty: {deadline.penalty}</p>
                                            )}
                                        </div>

                                        <button
                                            className="btn btn-success btn-mark-complete"
                                            onClick={() => markDeadlineComplete(deadline.id)}
                                        >
                                            ✓ Done
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredDeadlines.length === 0 && (
                        <div className="empty-state">
                            <span className="empty-icon">🎉</span>
                            <h3>All caught up!</h3>
                            <p>No deadlines matching your filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
