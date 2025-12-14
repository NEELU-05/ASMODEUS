import { FlightGenerator } from './FlightGenerator.js';
import { formatAmadeusDate } from '../utils/dateHash.js';
import { Session } from './Session.js';

export class AvailabilityService {
    static async search(session: Session, cmdArgs: string, direct: boolean = false): Promise<string> {
        let dateStr = formatAmadeusDate(new Date());
        let origin = "DEL";
        let dest = "DOH";

        // Parse: DDMMMORGDEST or ORGDEST
        const longMatch = cmdArgs.match(/^(\d{2}[A-Z]{3})([A-Z]{3})([A-Z]{3})$/);
        const shortMatch = cmdArgs.match(/^([A-Z]{3})([A-Z]{3})$/);

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

        // Generate flights for first matching pair
        const flights = await FlightGenerator.generateFlights(origins[0], dests[0], dateStr, direct);

        if (flights.length === 0) {
            return `NO FLIGHTS FOUND FOR ${origin} -> ${dest}`;
        }

        // Store in session for selling
        session.area.availabilityResults = flights;

        return this.formatResponse(flights, dateStr, origin, dest);
    }

    private static formatResponse(flights: any[], dateStr: string, origin: string, dest: string): string {
        // Header: ** AMADEUS AVAILABILITY - AN ** LON LONDON.GB                   58 SA 18SEP 0000
        const cityName = this.getCityName(dest);
        const header = `** AMADEUS AVAILABILITY - AN ** ${dest} ${cityName.padEnd(20)}  58 SA ${dateStr} 0000`;
        let body = "";

        flights.forEach((flt, index) => {
            const lineNum = (index + 1).toString().padStart(2);
            const al = flt.airline;
            const fn = flt.flightNumber.padEnd(4);

            // Format classes (split into 2 lines)
            const classList = this.getClassList(flt.classes);
            const row1Classes = classList.slice(0, 7).join(" ");
            const row2Classes = classList.slice(7).join(" ");

            // Route display
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

            // Line 1: Flight info
            const line1 = `${lineNum}  ${al} ${fn} ${row1Classes.padEnd(22)} ${routeStr.padEnd(12)} ${stopsStr}  ${depTime} ${arrTime}${dayOffsetStr.padStart(3)}  ${equipStr}  ${elapsedStr}`;
            body += line1 + "\n";

            // Line 2: Remaining classes (if any)
            if (row2Classes) {
                const indent = " ".repeat(12);
                body += `${indent}${row2Classes}\n`;
            }
        });

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
