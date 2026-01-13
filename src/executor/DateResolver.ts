export class DateResolver {
    private static readonly FORMATS = [
        'DD-MM-YYYY',
        'DD-MMM-YYYY',
        'MM-DD-YYYY',
        'YYYY-MM-DD',
        'D-M-YYYY',
        'DD/MM/YYYY',
        'MM/DD/YYYY'
    ];

    /**
     * Resolves a date string into a formatted output string.
     * @param dateInput e.g., "11-01-2026", "25 days"
     * @param outputFormat e.g., "DD-MM-YYYY"
     */
    static resolveDate(dateInput: string, outputFormat: string = 'DD-MM-YYYY'): string {
        if (!dateInput) return "";

        let date = new Date();

        // 1. Try relative date: "X days", "X months", "X years"
        const relativeMatch = dateInput.match(/(\d+)\s*(day|month|year)s?/i);
        if (relativeMatch) {
            const amount = parseInt(relativeMatch[1]);
            const unit = relativeMatch[2].toLowerCase();

            if (unit.startsWith('day')) date.setDate(date.getDate() + amount);
            else if (unit.startsWith('month')) date.setMonth(date.getMonth() + amount);
            else if (unit.startsWith('year')) date.setFullYear(date.getFullYear() + amount);

            return this.formatDate(date, outputFormat);
        }

        // 2. Try absolute date (Basic JS Date parsing)
        const parsed = new Date(dateInput);
        if (!isNaN(parsed.getTime())) {
            return this.formatDate(parsed, outputFormat);
        }

        console.warn(`[DateResolver] Could not resolve: ${dateInput}`);
        return dateInput;
    }

    private static formatDate(date: Date, format: string): string {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const mmm = date.toLocaleString('default', { month: 'short' }).toUpperCase();

        return format
            .replace('DD', dd)
            .replace('MM', mm)
            .replace('YYYY', String(yyyy))
            .replace('MMM', mmm);
    }
}
