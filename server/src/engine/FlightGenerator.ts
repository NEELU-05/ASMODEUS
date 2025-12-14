import { DateHashRandom, parseAmadeusDate, formatAmadeusDate, calculateDayOffset, calculateElapsedTime } from '../utils/dateHash';
import { pool } from '../db/mysql';

interface GeneratedFlight {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    depTime: string;
    arrTime: string;
    equipment: string;
    classes: { [key: string]: number };
    stops: number;
    via?: string;
    dayOffset: number;
    elapsedTime: string;
}

/**
 * Flight Generator - Creates realistic, date-driven random flights
 * Same route + same date = same flights every time
 */
export class FlightGenerator {

    private static AIRLINES = ['AI', 'IX', 'UK', '6E', 'SG', 'QR', 'EK', 'EY', 'BA', 'LH', 'AF', 'KL', 'SQ', 'CX', 'JL', 'NH', 'UA', 'AA', 'DL', 'AC', 'TK'];
    private static EQUIPMENT = ['320', '321', '737', '738', '777', '787', '350', '330', '343', 'E90', 'CR9'];
    private static HUBS: { [key: string]: string[] } = {
        'AI': ['DEL', 'BOM', 'MAA', 'BLR'],
        'EK': ['DXB'],
        'QR': ['DOH'],
        'BA': ['LHR'],
        'LH': ['FRA', 'MUC'],
        'AF': ['CDG'],
        'SQ': ['SIN'],
        'UA': ['ORD', 'IAD', 'SFO'],
        'AA': ['DFW', 'ORD', 'JFK'],
        'DL': ['ATL', 'DTW', 'MSP']
    };

    /**
     * Generate flights for a route and date
     */
    static async generateFlights(
        origin: string,
        destination: string,
        dateStr: string,
        direct: boolean = false
    ): Promise<GeneratedFlight[]> {

        const rng = new DateHashRandom(`${origin}${destination}`, dateStr);
        const flights: GeneratedFlight[] = [];

        // Parse date
        let travelDate: Date;
        try {
            travelDate = parseAmadeusDate(dateStr);
        } catch {
            travelDate = new Date();
        }

        // Generate 3-8 direct flights
        const numDirect = rng.nextInt(3, 8);
        for (let i = 0; i < numDirect; i++) {
            flights.push(this.generateDirectFlight(origin, destination, travelDate, rng));
        }

        // Generate 2-5 connecting flights (if not direct-only)
        if (!direct) {
            const numConnecting = rng.nextInt(2, 5);
            for (let i = 0; i < numConnecting; i++) {
                const connecting = this.generateConnectingFlight(origin, destination, travelDate, rng);
                if (connecting) flights.push(connecting);
            }
        }

        // Sort by total elapsed time (shortest first)
        flights.sort((a, b) => {
            const aTime = this.parseElapsedTime(a.elapsedTime);
            const bTime = this.parseElapsedTime(b.elapsedTime);
            return aTime - bTime;
        });

        return flights;
    }

    private static generateDirectFlight(origin: string, dest: string, date: Date, rng: DateHashRandom): GeneratedFlight {
        const airline = rng.choice(this.AIRLINES);
        const flightNumber = rng.nextInt(100, 9999).toString();

        // Generate departure time (00:00 - 23:00)
        const depHour = rng.nextInt(0, 23);
        const depMin = rng.choice([0, 15, 30, 45]);
        const depTime = `${depHour.toString().padStart(2, '0')}${depMin.toString().padStart(2, '0')}`;

        // Calculate arrival (2-16 hours later)
        const flightDuration = rng.nextInt(120, 960); // minutes
        const arrivalMinutes = depHour * 60 + depMin + flightDuration;
        const arrHour = Math.floor(arrivalMinutes / 60) % 24;
        const arrMin = arrivalMinutes % 60;
        const arrTime = `${arrHour.toString().padStart(2, '0')}${arrMin.toString().padStart(2, '0')}`;

        const dayOffset = Math.floor(arrivalMinutes / (24 * 60));
        const elapsedTime = calculateElapsedTime(depTime, arrTime, dayOffset);

        return {
            airline,
            flightNumber,
            origin,
            destination: dest,
            depTime,
            arrTime,
            equipment: rng.choice(this.EQUIPMENT),
            classes: this.generateClassInventory(rng),
            stops: 0,
            dayOffset,
            elapsedTime
        };
    }

    private static generateConnectingFlight(origin: string, dest: string, date: Date, rng: DateHashRandom): GeneratedFlight | null {
        // Pick a random hub
        const airline = rng.choice(this.AIRLINES);
        const hubs = this.HUBS[airline] || ['DXB', 'DOH', 'SIN', 'FRA', 'CDG'];
        const via = rng.choice(hubs);

        // Don't connect via origin or destination
        if (via === origin || via === dest) return null;

        const flightNumber = rng.nextInt(100, 9999).toString();

        const depHour = rng.nextInt(0, 23);
        const depMin = rng.choice([0, 15, 30, 45]);
        const depTime = `${depHour.toString().padStart(2, '0')}${depMin.toString().padStart(2, '0')}`;

        // Total journey: 4-20 hours
        const totalDuration = rng.nextInt(240, 1200);
        const arrivalMinutes = depHour * 60 + depMin + totalDuration;
        const arrHour = Math.floor(arrivalMinutes / 60) % 24;
        const arrMin = arrivalMinutes % 60;
        const arrTime = `${arrHour.toString().padStart(2, '0')}${arrMin.toString().padStart(2, '0')}`;

        const dayOffset = Math.floor(arrivalMinutes / (24 * 60));
        const elapsedTime = calculateElapsedTime(depTime, arrTime, dayOffset);

        return {
            airline,
            flightNumber,
            origin,
            destination: dest,
            depTime,
            arrTime,
            equipment: rng.choice(this.EQUIPMENT),
            classes: this.generateClassInventory(rng),
            stops: 1,
            via,
            dayOffset,
            elapsedTime
        };
    }

    private static generateClassInventory(rng: DateHashRandom): { [key: string]: number } {
        return {
            'F': rng.nextInt(0, 4),
            'J': rng.nextInt(4, 9),
            'C': rng.nextInt(4, 9),
            'D': rng.nextInt(0, 9),
            'R': rng.nextInt(0, 9),
            'I': rng.nextInt(0, 9),
            'Y': rng.nextInt(4, 9),
            'B': rng.nextInt(0, 9),
            'M': rng.nextInt(0, 9),
            'H': rng.nextInt(0, 9),
            'Q': rng.nextInt(0, 9),
            'K': rng.nextInt(0, 9),
            'L': rng.nextInt(0, 9),
            'V': rng.nextInt(0, 4),
            'T': rng.nextInt(0, 4),
            'S': rng.nextInt(0, 4)
        };
    }

    private static parseElapsedTime(elapsed: string): number {
        const [hours, minutes] = elapsed.split(':').map(Number);
        return hours * 60 + minutes;
    }
}
