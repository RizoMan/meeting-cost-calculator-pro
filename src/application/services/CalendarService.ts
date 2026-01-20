
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export interface CalendarEvent {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    durationMinutes: number;
    description?: string;
    color?: string;
    attendees?: {
        email?: string;
        name?: string;
        role?: string;
        status?: string;
        type?: string;
    }[];
}

export class CalendarService {

    static async requestPermissions(): Promise<boolean> {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        return status === 'granted';
    }

    static async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            throw new Error('MISSING_PERMISSION');
        }

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const calendarIds = calendars.map(c => c.id);

        if (calendarIds.length === 0) return [];

        // Range: Entire selected day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);

        return events
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .map(e => {
                // DEBUG LOG - Remove later
                if ((e as any).attendees) {
                     console.log('Event has attendees:', e.title, (e as any).attendees);
                } else {
                     console.log('Event has NO attendees:', e.title);
                }

                const startDateStr = e.startDate instanceof Date ? e.startDate.toISOString() : e.startDate;
                const endDateStr = e.endDate instanceof Date ? e.endDate.toISOString() : e.endDate;
                
                const start = new Date(startDateStr).getTime();
                const end = new Date(endDateStr).getTime();
                const durationMinutes = Math.round((end - start) / 1000 / 60);

                return {
                    id: e.id,
                    title: e.title,
                    startDate: startDateStr,
                    endDate: endDateStr,
                    durationMinutes,
                    description: e.notes,
                    color: '#3b82f6', // Default blue-ish
                    attendees: (e as any).attendees // Type casting as expo-calendar types might be incomplete
                };
            });

    }

    static async getEventDetails(id: string): Promise<CalendarEvent | null> {
        try {
            const e = await Calendar.getEventAsync(id);
            if (!e) return null;

            console.log('Deep Fetch Event:', e.title);
            
            // Explicitly fetch attendees if they are missing
            let attendees = e.attendees;
            if (!attendees || attendees.length === 0) {
                 try {
                     // @ts-ignore: This method exists in expo-calendar but might be missing in types or platform specific
                     attendees = await Calendar.getAttendeesForEventAsync(id);
                     console.log('Explicit Attendees Fetch:', attendees);
                 } catch (attErr) {
                     console.log('Error fetching attendees explicitly:', attErr);
                 }
            }
            
            console.log('Final Attendees List:', attendees);

            const startDateStr = e.startDate instanceof Date ? e.startDate.toISOString() : e.startDate;
            const endDateStr = e.endDate instanceof Date ? e.endDate.toISOString() : e.endDate;
            
            const start = new Date(startDateStr).getTime();
            const end = new Date(endDateStr).getTime();
            const durationMinutes = Math.round((end - start) / 1000 / 60);

            return {
                id: e.id,
                title: e.title,
                startDate: startDateStr,
                endDate: endDateStr,
                durationMinutes,
                description: e.notes,
                color: '#3b82f6',
                attendees: attendees
            };
        } catch (error) {
            console.error('Error fetching event details:', error);
            return null;
        }
    }
}
