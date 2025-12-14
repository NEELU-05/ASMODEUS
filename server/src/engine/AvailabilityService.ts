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
            const lineNum = (start + index + 1).toString().padStart(2); // Col 1-2
            const al = flt.airline.padEnd(3); // Col 4-6
            const fn = flt.flightNumber.padEnd(5); // Col 7-11

            // Classes: Fixed width 22 chars (J9 C9 D9 I9 Y9 B9 H9)
            // Need exactly 2 chars per class + 1 space = 3 chars/item * 7 items = 21 + 1 = 22
            // Actually Amadeus uses variable spacing depending on view, but let's fix to grid.
            const classList = this.getClassList(flt.classes);
            const row1Classes = classList.slice(0, 7).map(c => c.padEnd(2)).join(" ").padEnd(23);
            const row2Classes = classList.slice(7).map(c => c.padEnd(2)).join(" ");

            // Route: /DEL DOH or /DEL DXB LHR
            // Fixed width ??
            let routeStr = `/${flt.origin}`;
            if (flt.via) {
                routeStr += ` ${flt.via}`;
            }
            routeStr += ` ${flt.destination}`;
            routeStr = routeStr.padEnd(13); // Fixed width 13

            const stopsStr = flt.stops.toString();
            const depTime = flt.depTime.replace(':', '').padEnd(4); // 0850
            const arrTime = flt.arrTime.replace(':', '').padEnd(4); // 1050
            const dayOffsetStr = flt.dayOffset > 0 ? `+${flt.dayOffset}` : '  ';
            const equipStr = `E0/${flt.equipment}`;
            const elapsedStr = flt.elapsedTime.replace(':', '');

            // LINE 1 CONSTRUCTION (STRICT COLUMN POSITIONS)
            // 123456789012345678901234567890123456789012345678901234567890
            // 1  AI 123  J9 C9 I9 Y9 M9  /DEL DOH   0  0800 1000      E0/320       200

            const line1 = `${lineNum} ${al}${fn} ${row1Classes} ${routeStr} ${stopsStr}  ${depTime} ${arrTime}${dayOffsetStr} ${equipStr} ${elapsedStr}`;
            body += line1 + "\n";

            // Line 2 (Overflow classes)
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
