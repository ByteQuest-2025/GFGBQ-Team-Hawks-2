import type { ComplianceObligation, Deadline, DeadlineStatus } from '../types';

// Get the next occurrence of a deadline based on frequency
function getNextDeadlineDate(obligation: ComplianceObligation, referenceDate: Date = new Date()): Date {
    const now = referenceDate;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (obligation.frequency) {
        case 'monthly':
            // Due on specific days based on obligation type
            if (obligation.id.includes('GSTR1')) {
                // GSTR-1 due on 11th
                const dueDate = new Date(currentYear, currentMonth + 1, 11);
                return dueDate;
            } else if (obligation.id.includes('GSTR3B')) {
                // GSTR-3B due on 20th
                const dueDate = new Date(currentYear, currentMonth + 1, 20);
                return dueDate;
            }
            // Default to 15th for other monthly obligations
            return new Date(currentYear, currentMonth + 1, 15);

        case 'quarterly':
            // Handle advance tax deadlines
            if (obligation.id.includes('ADVANCE_TAX_Q1')) {
                let year = currentYear;
                if (currentMonth >= 5) year++; // June 15 passed, next year
                return new Date(year, 5, 15); // June 15
            }
            if (obligation.id.includes('ADVANCE_TAX_Q2')) {
                let year = currentYear;
                if (currentMonth >= 8) year++; // Sept 15 passed
                return new Date(year, 8, 15); // September 15
            }
            if (obligation.id.includes('ADVANCE_TAX_Q3')) {
                let year = currentYear;
                if (currentMonth >= 11) year++; // Dec 15 passed
                return new Date(year, 11, 15); // December 15
            }
            if (obligation.id.includes('ADVANCE_TAX_Q4')) {
                let year = currentYear;
                if (currentMonth >= 2 && currentMonth < 5) { // After March 15
                    year++;
                }
                return new Date(year, 2, 15); // March 15
            }
            // GSTR-1 Quarterly
            if (obligation.id.includes('GSTR1_QUARTERLY')) {
                const quarters = [
                    new Date(currentYear, 6, 13),   // July 13 (for Apr-Jun)
                    new Date(currentYear, 9, 13),   // Oct 13 (for Jul-Sep)
                    new Date(currentYear + 1, 0, 13), // Jan 13 (for Oct-Dec)
                    new Date(currentYear + 1, 3, 13)  // Apr 13 (for Jan-Mar)
                ];
                return quarters.find(d => d > now) || quarters[0];
            }
            // TDS Returns
            if (obligation.id.includes('TDS_RETURN')) {
                const quarters = [
                    new Date(currentYear, 6, 31),   // July 31 (Q1)
                    new Date(currentYear, 9, 31),   // Oct 31 (Q2)
                    new Date(currentYear + 1, 0, 31), // Jan 31 (Q3)
                    new Date(currentYear + 1, 4, 31)  // May 31 (Q4)
                ];
                return quarters.find(d => d > now) || quarters[0];
            }
            // Default quarterly - next quarter end
            const quarterMonths = [2, 5, 8, 11];
            const nextQuarter = quarterMonths.find(m => m > currentMonth) || quarterMonths[0];
            return new Date(nextQuarter <= currentMonth ? currentYear + 1 : currentYear, nextQuarter, 28);

        case 'annual':
            // ITR due July 31
            if (obligation.id.includes('ITR')) {
                let year = currentYear;
                if (currentMonth >= 6) year++; // After July, next year
                return new Date(year, 6, 31); // July 31
            }
            // Default annual - March 31
            return new Date(currentMonth >= 2 ? currentYear + 1 : currentYear, 2, 31);

        case 'one_time':
            // GST Registration - give 30 days from now
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        default:
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
}

// Calculate days remaining
function getDaysRemaining(dueDate: Date): number {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Determine deadline status based on days remaining
function getDeadlineStatus(daysRemaining: number): DeadlineStatus {
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 7) return 'due_soon';
    return 'upcoming';
}

// Generate deadlines from obligations
export function generateDeadlines(obligations: ComplianceObligation[]): Deadline[] {
    const deadlines: Deadline[] = [];

    for (const obligation of obligations) {
        const dueDate = getNextDeadlineDate(obligation);
        const daysRemaining = getDaysRemaining(dueDate);
        const status = getDeadlineStatus(daysRemaining);

        deadlines.push({
            id: `deadline-${obligation.id}-${dueDate.getTime()}`,
            obligationId: obligation.id,
            obligationName: obligation.name,
            dueDate,
            status,
            description: obligation.description,
            penalty: obligation.penalty,
            daysRemaining
        });
    }

    // Sort by due date
    deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return deadlines;
}

// Get upcoming deadlines (next 90 days)
export function getUpcomingDeadlines(deadlines: Deadline[], days: number = 90): Deadline[] {
    return deadlines.filter(d => d.daysRemaining <= days && d.status !== 'completed');
}

// Get overdue deadlines
export function getOverdueDeadlines(deadlines: Deadline[]): Deadline[] {
    return deadlines.filter(d => d.status === 'overdue');
}

// Get deadlines due this week
export function getDeadlinesDueThisWeek(deadlines: Deadline[]): Deadline[] {
    return deadlines.filter(d => d.daysRemaining >= 0 && d.daysRemaining <= 7);
}

// Format date for display
export function formatDeadlineDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}
