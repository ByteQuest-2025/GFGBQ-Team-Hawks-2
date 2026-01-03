import type { Deadline, RiskAlert, AlertLevel } from '../types';

// Generate risk alerts based on deadlines
export function generateAlerts(deadlines: Deadline[]): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    for (const deadline of deadlines) {
        let level: AlertLevel;
        let title: string;
        let message: string;
        let action: string;

        if (deadline.status === 'overdue') {
            level = 'critical';
            title = `⚠️ OVERDUE: ${deadline.obligationName}`;
            message = `This was due on ${formatDate(deadline.dueDate)}. ${deadline.penalty ? `Penalty: ${deadline.penalty}` : 'Late fees may apply.'}`;
            action = 'File immediately to minimize penalties';

            alerts.push({
                id: `alert-overdue-${deadline.id}`,
                level,
                title,
                message,
                deadlineId: deadline.id,
                action,
                createdAt: new Date()
            });
        } else if (deadline.status === 'due_soon') {
            level = 'warning';
            title = `⏰ Due Soon: ${deadline.obligationName}`;
            message = `Due in ${deadline.daysRemaining} days on ${formatDate(deadline.dueDate)}. Don't miss this deadline!`;
            action = deadline.daysRemaining <= 3 ? 'Complete today to be safe' : 'Plan to complete this week';

            alerts.push({
                id: `alert-due-soon-${deadline.id}`,
                level,
                title,
                message,
                deadlineId: deadline.id,
                action,
                createdAt: new Date()
            });
        }
    }

    // Sort by severity (critical first)
    alerts.sort((a, b) => {
        const order: Record<AlertLevel, number> = { critical: 0, warning: 1, info: 2 };
        return order[a.level] - order[b.level];
    });

    return alerts;
}

// Format date helper
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Get critical alerts only
export function getCriticalAlerts(alerts: RiskAlert[]): RiskAlert[] {
    return alerts.filter(a => a.level === 'critical');
}

// Get warning alerts only
export function getWarningAlerts(alerts: RiskAlert[]): RiskAlert[] {
    return alerts.filter(a => a.level === 'warning');
}

// Get alert counts by level
export function getAlertCounts(alerts: RiskAlert[]): Record<AlertLevel, number> {
    return {
        critical: alerts.filter(a => a.level === 'critical').length,
        warning: alerts.filter(a => a.level === 'warning').length,
        info: alerts.filter(a => a.level === 'info').length
    };
}
