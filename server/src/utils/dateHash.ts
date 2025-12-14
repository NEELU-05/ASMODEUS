import crypto from 'crypto';

/**
 * Date-driven deterministic random number generator
 * Same route + same date = same flights every time
 */
export class DateHashRandom {
    private seed: number;
    private state: number;

    constructor(route: string, date: string) {
        // Create deterministic seed from route + date
        const hash = crypto.createHash('md5').update(`${route}:${date}`).digest('hex');
        this.seed = parseInt(hash.substring(0, 8), 16);
        this.state = this.seed;
    }

    // Linear Congruential Generator (LCG)
    next(): number {
        this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
        return this.state / 0x7fffffff;
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    choice<T>(array: T[]): T {
        return array[this.nextInt(0, array.length - 1)];
    }

    shuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

/**
 * Parse date string (DDMMM format) to Date object
 */
export function parseAmadeusDate(dateStr: string): Date {
    const months: { [key: string]: number } = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    const day = parseInt(dateStr.substring(0, 2));
    const monthStr = dateStr.substring(2, 5).toUpperCase();
    const month = months[monthStr];

    if (month === undefined || isNaN(day)) {
        throw new Error('Invalid date format');
    }

    const now = new Date();
    let year = now.getFullYear();
    const testDate = new Date(year, month, day);

    // If date is in the past, use next year
    if (testDate < now) {
        year++;
    }

    return new Date(year, month, day);
}

/**
 * Format Date to Amadeus format (DDMMM)
 */
export function formatAmadeusDate(date: Date): string {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    return `${day}${month}`;
}

/**
 * Calculate day offset (+1, +2, etc.)
 */
export function calculateDayOffset(depDate: Date, arrDate: Date): string {
    const diff = Math.floor((arrDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `+${diff}` : '';
}

/**
 * Calculate elapsed time (HH:MM format)
 */
export function calculateElapsedTime(depTime: string, arrTime: string, dayOffset: number = 0): string {
    const depHour = parseInt(depTime.substring(0, 2));
    const depMin = parseInt(depTime.substring(2, 4));
    const arrHour = parseInt(arrTime.substring(0, 2));
    const arrMin = parseInt(arrTime.substring(2, 4));

    let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    totalMinutes += dayOffset * 24 * 60;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}
