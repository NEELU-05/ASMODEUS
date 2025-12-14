import { FlightGenerator } from './FlightGenerator.js';
import { formatAmadeusDate } from '../utils/dateHash.js';
import { Session } from './Session.js';

export class AvailabilityService {
    static async search(session: Session, cmdArgs: string, direct: boolean = false): Promise<string> {
        let dateStr = formatAmadeusDate(new Date());
        let origin = "DEL";
        let dest = "DOH";

        // Parse: DDMMMORGDEST or ORGDEST or AN...
        // Basic parser for "12JANDELDOH" or "DELDOH"
        const longMatch = cmdArgs.match(/^(\d{2}[A-Z]{3})([A-Z]{3})([A-Z]{3})$/);
        const shortMatch = cmdArgs.match(/^([A-Z]{3})([A-Z]{3})$/);

        // Also handle "AN12JANDELDOH" if passed directly from CP
        // The CP usually strips "AN" or handles command type. 
        // Logic in CP: intent.args.rawParams

        if (longMatch) {
            dateStr = longMatch[1];
            origin = longMatch[2];
            dest = longMatch[3];
        } else if (shortMatch) {
            origin = shortMatch[1];
            dest = shortMatch[2];
        }

        // City code mapping
        const cityMap: { [key: string]: string[] } = {
            'LON': ['LHR', 'LGW', 'LCY', 'STN', 'LTN'],
            'NYC': ['JFK', 'EWR', 'LGA'],
            'PAR': ['CDG', 'ORY'],
            'TYO': ['NRT', 'HND'],
            'ATH': ['ATH'],
            'BOM': ['BOM'],
            'DEL': ['DEL']
        };

        const dests = cityMap[dest] || [dest];
        const origins = cityMap[origin] || [origin];

        // Generate flights for first matching pair (Simplification for v1.0)
        let flights: any[] = [];
        try {
            flights = await FlightGenerator.generateFlights(origins[0], dests[0], dateStr, direct);
        } catch (error: any) {
            console.error("Flight Generation Error:", error);
            return `AVAILABILITY ERROR: ${error.message}`;
        }

        if (flights.length === 0) {
            return `NO FLIGHTS FOUND FOR ${origin} -> ${dest}`;
        }

        // Store in session
        session.area.availabilityResults = flights;
        session.area.paging.totalItems = flights.length;
        session.area.paging.currentStart = 0;

        // Store search context if possible? For now passing explicit params
        return this.formatResponse(session, dateStr, origin, dest);
    }

    static moveDown(session: Session): string {
        if (!session.area.availabilityResults || session.area.availabilityResults.length === 0) {
            return "NO AVAILABILITY TO SCROLL";
        }

        const newStart = session.area.paging.currentStart + session.area.paging.pageSize;
        if (newStart >= session.area.paging.totalItems) {
            return "LAST PAGE";
        }

        session.area.paging.currentStart = newStart;

        // Recover context from stored results (Approximation)
        const first = session.area.availabilityResults[0];
        // Date is not stored on flight object in current generator, so defaulting or needing context.
        // For v1.1, we'll just use "12JAN" or similar if we can't find it.
        // Or better, we format response without date in header if missing? 
        // Amadeus allows scrolling without re-stating date.

        return this.formatResponse(session, "12JAN", first.origin, first.destination);
    }

    static moveTop(session: Session): string {
        if (!session.area.availabilityResults?.length) return "NO AVAILABILITY TO SCROLL";

        session.area.paging.currentStart = 0;
        const first = session.area.availabilityResults[0];
        return this.formatResponse(session, "12JAN", first.origin, first.destination);
    }

    static moveBottom(session: Session): string {
        if (!session.area.availabilityResults?.length) return "NO AVAILABILITY TO SCROLL";

        // Go to last page
        const lastPageStart = Math.floor((session.area.paging.totalItems - 1) / session.area.paging.pageSize) * session.area.paging.pageSize;
        session.area.paging.currentStart = lastPageStart;

        const first = session.area.availabilityResults[0];
        return this.formatResponse(session, "12JAN", first.origin, first.destination);
    }

    static async moveNextDay(session: Session, days: number = 1): Promise<string> {
        // Mock implementation: Just refreshes current results but claims it is +1 day
        // Ideally should extract current date, add days, and re-search.
        // For v1, let's re-run last search params if implementation allowed, else stub.
        return "FOLLOWING DAY - 13JAN (MOCKED)";
    }

    static async movePreviousDay(session: Session, days: number = 1): Promise<string> {
        return "PREVIOUS DAY - 11JAN (MOCKED)";
    }

    static async changeDate(session: Session, newDate: string): Promise<string> {
        // Should re-trigger search with new date but same OD
        return `AVAILABILITY CHANGE TO ${newDate} - (MOCKED)`;
    }

    static async getTimetable(session: Session, params: string): Promise<string> {
        return "TN - TIMETABLE DISPLAY (NOT YET IMPLEMENTED)";
    }

    static moveUp(session: Session): string {
        if (!session.area.availabilityResults || session.area.availabilityResults.length === 0) {
            return "NO AVAILABILITY TO SCROLL";
        }

        const newStart = session.area.paging.currentStart - session.area.paging.pageSize;
        if (newStart < 0) {
            session.area.paging.currentStart = 0;
            return "TOP OF LIST";
        } else {
            session.area.paging.currentStart = newStart;
        }

        const first = session.area.availabilityResults[0];
        return this.formatResponse(session, "12JAN", first.origin, first.destination);
    }

    private static formatResponse(session: Session, dateStr: string, origin: string, dest: string): string {
        const flights = session.area.availabilityResults;
        const start = session.area.paging.currentStart;
        const end = Math.min(start + session.area.paging.pageSize, flights.length);

        const pageFlights = flights.slice(start, end);

        // Header
        const cityName = this.getCityName(dest);
        const header = `** AMADEUS AVAILABILITY - AN ** ${dest} ${cityName.padEnd(20)}  58 SA ${dateStr} 0000`;
        let body = "";

        if (pageFlights.length === 0) return "NO FLIGHTS ON THIS PAGE";

        pageFlights.forEach((flt, index) => {
            // Absolute index for line number (1, 2, 3...) regardless of page?
            // Amadeus actually renumbers or keeps absolute?
            // Usually absolute: 1, 2, 3...
            const lineNum = (start + index + 1).toString().padStart(2);

            const al = flt.airline;
            const fn = flt.flightNumber.padEnd(4);

            // Format classes
            const classList = this.getClassList(flt.classes);
            const row1Classes = classList.slice(0, 7).join(" ");
            const row2Classes = classList.slice(7).join(" ");

            // Route
            let routeStr = `/${flt.origin}`;
            if (flt.via) {
                routeStr += ` ${flt.via}`;
            }
            routeStr += ` ${flt.destination}`;

            const stopsStr = flt.stops.toString();
            const depTime = flt.depTime.padEnd(6);
            const arrTime = flt.arrTime;
            const dayOffsetStr = flt.dayOffset > 0 ? `+${flt.dayOffset}` : '';
            const equipStr = `E0/${flt.equipment}`;
            const elapsedStr = flt.elapsedTime;

            // Line 1
            const line1 = `${lineNum}  ${al} ${fn} ${row1Classes.padEnd(22)} ${routeStr.padEnd(12)} ${stopsStr}  ${depTime} ${arrTime}${dayOffsetStr.padStart(3)}  ${equipStr}  ${elapsedStr}`;
            body += line1 + "\n";

            // Line 2
            if (row2Classes) {
                const indent = " ".repeat(12);
                body += `${indent}${row2Classes}\n`;
            }
        });

        // Add footer for pagination info
        if (end < flights.length) {
            body += `MD TO SCROLL DOWN (${end}/${flights.length})`;
        } else if (start > 0) {
            body += `MU TO SCROLL UP`;
        }

        return `${header}\n${body}`;
    }

    private static getClassList(classes: { [key: string]: number }): string[] {
        const order = ['F', 'J', 'C', 'D', 'R', 'I', 'Y', 'B', 'M', 'H', 'Q', 'K', 'L', 'V', 'T', 'S'];
        const list: string[] = [];
        for (const cls of order) {
            if (classes[cls] !== undefined) {
                list.push(`${cls}${classes[cls]}`);
            }
        }
        return list;
    }

    private static getCityName(code: string): string {
        const map: { [key: string]: string } = {
            'DEL': 'DELHI.IN',
            'DOH': 'DOHA.QA',
            'LHR': 'LONDON.GB',
            'DXB': 'DUBAI.AE',
            'JFK': 'NEW YORK.US',
            'BOM': 'MUMBAI.IN',
            'ATH': 'ATHENS.GR',
            'LON': 'LONDON.GB',
            'SIN': 'SINGAPORE.SG',
            'FRA': 'FRANKFURT.DE',
            'CDG': 'PARIS.FR'
        };
        return map[code] || code;
    }
}
