import { Meeting, Participant } from '../entities/Meeting';

export class CostCalculator {
  /**
   * Calculates the total cost of a meeting based on its duration and participants.
   * Logic: (Total Hourly Rate / 3600) * Elapsed Seconds
   */
  static calculateTotalCost(meeting: Meeting): number {
    if (meeting.participants.length === 0) {
      return 0;
    }

    const totalHourlyRate = meeting.participants.reduce(
      (sum, p) => sum + p.hourlyRate,
      0
    );

    const costPerSecond = totalHourlyRate / 3600;
    return costPerSecond * meeting.elapsedSeconds;
  }

  /**
   * Calculates the instantaneous burn rate per minute.
   */
  static calculateBurnRatePerMinute(participants: Participant[]): number {
    const totalHourlyRate = participants.reduce((sum, p) => sum + p.hourlyRate, 0);
    return totalHourlyRate / 60;
  }
}
