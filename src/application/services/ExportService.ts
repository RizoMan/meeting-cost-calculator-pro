
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Meeting } from '../../domain/entities/Meeting';


// Helper to format date
const formatDate = (date: Date | null, locale: string = 'en-US') => {
    if (!date) return 'Unknown Date';
    return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale);
};

// Helper to format money (basic)
const formatMoney = (amount: number, symbol: string) => {
    return `${symbol}${amount.toFixed(2)}`;
};

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
}

export class ExportService {
    
    static async generateMeetingPDF(meeting: Meeting, currencySymbol: string = '$', currencyCode: string = 'USD', t: (key: string) => string, locale: string = 'en-US') {
        const html = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; color: #000; margin: 0; }
                    .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
                    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .meta-item { background: #f9f9f9; padding: 15px; border-radius: 8px; }
                    .meta-label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px; }
                    .meta-value { font-size: 18px; font-weight: bold; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .table th { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #666; font-size: 12px; text-transform: uppercase; }
                    .table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
                    .total-box { margin-top: 40px; text-align: right; }
                    .total-label { font-size: 14px; color: #666; }
                    .total-value { font-size: 32px; font-weight: bold; color: #2ecc71; margin-top: 5px; }
                    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">${t('report.title')}</h1>
                    <p class="subtitle">${t('report.generatedBy')}</p>
                </div>

                <div class="meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">${t('report.date')}</div>
                        <div class="meta-value">${formatDate(meeting.startTime, locale)}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">${t('report.duration')}</div>
                        <div class="meta-value">${formatDuration(meeting.elapsedSeconds)}</div>
                    </div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>${t('report.participant')}</th>
                            <th>${t('report.rate')}</th>
                            <th>${t('report.cost')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${meeting.participants.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${currencySymbol}${p.hourlyRate}/hr</td>
                                <td>${currencySymbol}${(p.hourlyRate * (meeting.elapsedSeconds / 3600)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-box">
                    <div class="total-label">${t('report.totalCost')}</div>
                    <div class="total-value">${formatMoney(meeting.accumulatedCost, currencySymbol)} <span style="font-size: 16px; color: #666;">${currencyCode}</span></div>
                </div>

                <div class="footer">
                    ${t('report.meetingId')}: ${meeting.id}
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        return uri;
    }

    static async generateHistoryCSV(history: Meeting[], t: (key: string) => string, locale: string = 'en-US') {
        // CSV Header (Localized)
        let csv = `${t('report.date')},${t('report.duration')} (min),${t('report.participant')},${t('report.totalCost')}\n`;

        // CSV Rows
        history.forEach(m => {
            const date = m.startTime ? new Date(m.startTime).toLocaleDateString(locale) : 'Unknown';
            const durationMin = (m.elapsedSeconds / 60).toFixed(1);
            const participants = m.participants.length;
            const cost = m.accumulatedCost.toFixed(2);
            
            // Handle commas in content by wrapping in quotes if needed
            csv += `"${date}",${durationMin},${participants},${cost}\n`;
        });

        // Save to file
        const fileName = `meeting_history_${Date.now()}.csv`;
        const uri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        return uri;
    }

    static async shareFile(uri: string) {
        if (!(await Sharing.isAvailableAsync())) {
            alert("Sharing is not available on this platform");
            return;
        }
        await Sharing.shareAsync(uri);
    }
}
