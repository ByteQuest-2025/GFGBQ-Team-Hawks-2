import { useStore } from '../lib/store';
import { OverviewModule } from '../components/dashboard/OverviewModule';

interface DashboardProps {
    user?: any;
}

export function Dashboard({ user }: DashboardProps) {
    const { profile, obligations, deadlines } = useStore();

    // 2. Data Filtering
    const userDisplayName = user?.fullName || profile?.ownerName || 'User';
    const firstName = userDisplayName.split(' ')[0];

    // Filter deadlines
    const upcomingDeadlines = deadlines.filter(d => d.status !== 'completed');
    const nextDeadline = upcomingDeadlines[0];

    // Stats
    const totalObligations = obligations.length;
    const completedObligations = obligations.filter(o =>
        deadlines.some(d => d.obligationId === o.id && d.status === 'completed')
    ).length;
    const complianceScore = Math.round((completedObligations / (totalObligations || 1)) * 100) || 85;

    return (
        <OverviewModule
            firstName={firstName}
            complianceScore={complianceScore}
            nextDeadline={nextDeadline}
            upcomingDeadlines={upcomingDeadlines}
        />
    );
}
