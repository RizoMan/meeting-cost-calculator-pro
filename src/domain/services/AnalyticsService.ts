import { Meeting } from "../entities/Meeting";

export interface DashboardStats {
    totalCost: number;
    totalDurationSeconds: number;
    meetingCount: number;
    averageCost: number;
    mostExpensiveMeeting: Meeting | null;
}

export class AnalyticsService {
    public static calculateStats(meetings: Meeting[]): DashboardStats {
        const totalCost = meetings.reduce((sum, m) => sum + m.accumulatedCost, 0);
        const totalDurationSeconds = meetings.reduce((sum, m) => sum + m.elapsedSeconds, 0);
        const meetingCount = meetings.length;
        const averageCost = meetingCount > 0 ? totalCost / meetingCount : 0;
        
        const mostExpensiveMeeting = meetings.length > 0
            ? meetings.reduce((prev, current) => (prev.accumulatedCost > current.accumulatedCost) ? prev : current)
            : null;

        return {
            totalCost,
            totalDurationSeconds,
            meetingCount,
            averageCost,
            mostExpensiveMeeting
        };
    }

    public static generateInsights(meetings: Meeting[]): string[] {
        if (meetings.length === 0) return ["Start tracking meetings to see AI insights here."];
        
        const insights: string[] = [];
        const stats = this.calculateStats(meetings);

        // 1. Cost Efficiency
        if (stats.averageCost > 1000) {
            insights.push("📉 Your average meeting cost is high (over $1,000). Consider shortening agendas.");
        } else if (stats.averageCost < 100) {
            insights.push("✅ Your meetings are cost-efficient on average.");
        }

        // 2. Duration Patterns
        const longMeetings = meetings.filter(m => m.elapsedSeconds > 3600); // > 1 hour
        if (longMeetings.length > meetings.length * 0.3) {
            insights.push(`⏱️ ${Math.round((longMeetings.length / meetings.length) * 100)}% of your meetings last over an hour. Trimming 15 mins could save significant budget.`);
        }

        // 3. Day of Week Analysis (Simple heuristic)
        if (meetings.length >= 5) {
            const dayCosts: Record<number, number> = {};
            meetings.forEach(m => {
                if (m.startTime) {
                    const day = m.startTime.getDay();
                    dayCosts[day] = (dayCosts[day] || 0) + m.accumulatedCost;
                }
            });
            
            // Find most expensive day
            let maxDay = -1;
            let maxCost = -1;
            Object.entries(dayCosts).forEach(([day, cost]) => {
                if (cost > maxCost) {
                    maxCost = cost;
                    maxDay = parseInt(day);
                }
            });

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (maxDay !== -1) {
                insights.push(`📅 ${days[maxDay]}s are your most expensive meeting days.`);
            }
        }

        // 4. Participant Count
        const crowdedMeetings = meetings.filter(m => m.participants.length > 6);
        if (crowdedMeetings.length > 0) {
            insights.push(`👥 You often have large groups (${crowdedMeetings.length} meetings with 7+ people). Amazon's 'Two Pizza Rule' suggests smaller teams are more efficient.`);
        }

        return insights;
    }
}
