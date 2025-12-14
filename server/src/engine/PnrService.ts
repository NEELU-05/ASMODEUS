import { pool, checkConnection } from '../db/mysql.js';
import { FlightSegment, Passenger } from './types.js';

export class PnrService {
    static async createPnr(locator: string, passengers: Passenger[], segments: FlightSegment[], remarks: string[] = [], osi: string[] = []): Promise<boolean> {
        try {
            // Check if DB is active
            const isConnected = await checkConnection();
            if (!isConnected) return false;

            const conn = await pool.getConnection();

            try {
                await conn.beginTransaction();

                // 1. Insert PNR
                await conn.execute(
                    'INSERT INTO pnrs (locator) VALUES (?)',
                    [locator]
                );

                // 2. Insert Passengers
                for (const pax of passengers) {
                    await conn.execute(
                        'INSERT INTO passengers (pnr_locator, last_name, first_name, type) VALUES (?, ?, ?, ?)',
                        [locator, pax.lastName, pax.firstName, pax.type]
                    );
                }

                // 3. Insert Segments
                for (const seg of segments) {
                    const dateStr = this.convertDateToISO(seg.date);
                    await conn.execute(
                        'INSERT INTO segments (pnr_locator, airline, flight_number, class, origin, destination, dep_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [locator, seg.airline, seg.flightNumber, seg.class, seg.origin, seg.dest, dateStr, seg.status]
                    );
                }

                // 4. Insert Remarks
                for (const rm of remarks) {
                    await conn.execute(
                        'INSERT INTO remarks (pnr_locator, text) VALUES (?, ?)',
                        [locator, rm]
                    );
                }

                // 5. Insert OSI
                for (const o of osi) {
                    await conn.execute(
                        'INSERT INTO osi (pnr_locator, text) VALUES (?, ?)',
                        [locator, o]
                    );
                }

                await conn.commit();
                console.log(`✅ PNR ${locator} saved to DB`);
                return true;

            } catch (err) {
                await conn.rollback();
                console.error(`❌ KPI Save Error for ${locator}:`, err);
                return false;
            } finally {
                conn.release();
            }

        } catch (err) {
            console.error('❌ DB Connection Error in createPnr:', err);
            return false;
        }
    }

    static async retrievePnr(locator: string): Promise<{ passengers: Passenger[], segments: FlightSegment[], remarks: string[], osi: string[] } | null> {
        try {
            // Check if DB is active
            const isConnected = await checkConnection();
            if (!isConnected) return null;

            const conn = await pool.getConnection();

            try {
                // Check if PNR exists
                const [rows]: any = await conn.execute('SELECT * FROM pnrs WHERE locator = ?', [locator]);
                if (rows.length === 0) return null;

                // Get Passengers
                const [paxRows]: any = await conn.execute('SELECT * FROM passengers WHERE pnr_locator = ?', [locator]);
                const passengers: Passenger[] = paxRows.map((row: any, index: number) => ({
                    line: index + 1,
                    lastName: row.last_name,
                    firstName: row.first_name,
                    type: row.type
                }));

                // Get Segments
                const [segRows]: any = await conn.execute('SELECT * FROM segments WHERE pnr_locator = ?', [locator]);
                const segments: FlightSegment[] = segRows.map((row: any, index: number) => ({
                    line: index + 1,
                    airline: row.airline,
                    flightNumber: row.flight_number,
                    class: row.class,
                    // Convert DB Date back to "12JAN" format
                    date: this.convertISOToDateStr(row.dep_date),
                    origin: row.origin,
                    dest: row.destination,
                    status: row.status,
                    seats: 1 // Logic to extract seats from status HK1 needed if critical
                }));

                // Get Remarks
                const [remRows]: any = await conn.execute('SELECT * FROM remarks WHERE pnr_locator = ?', [locator]);
                const remarks: string[] = remRows.map((row: any) => row.text);

                // Get OSI
                const [osiRows]: any = await conn.execute('SELECT * FROM osi WHERE pnr_locator = ?', [locator]);
                const osi: string[] = osiRows.map((row: any) => row.text);

                return { passengers, segments, remarks, osi };

            } finally {
                conn.release();
            }
        } catch (err) {
            console.error(`❌ Retrieve PNR Error for ${locator}:`, err);
            return null;
        }
    }

    private static convertDateToISO(dateStr: string): string {
        // Input: "12JAN"
        // Output: "2024-01-12"
        const day = dateStr.substring(0, 2);
        const monthStr = dateStr.substring(2);
        const months: { [key: string]: string } = {
            'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
            'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        };
        const month = months[monthStr] || '01';

        const now = new Date();
        const currentYear = now.getFullYear();
        return `${currentYear}-${month}-${day}`;
    }

    private static convertISOToDateStr(isoDate: Date | string): string {
        // Input: Date object or "2024-01-12" string
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, '0');
        const monthIndex = date.getMonth();
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return `${day}${months[monthIndex]}`;
    }

    static async logHistory(locator: string, action: string, details: string, agentId: string): Promise<void> {
        try {
            const conn = await pool.getConnection();
            try {
                await conn.execute(
                    'INSERT INTO pnr_history (pnr_locator, action, details, agent_id) VALUES (?, ?, ?, ?)',
                    [locator, action, details, agentId]
                );
            } finally {
                conn.release();
            }
        } catch (err) {
            console.error(`❌ Failed to log history for ${locator}:`, err);
        }
    }

    static async getHistory(locator: string): Promise<string[]> {
        try {
            const conn = await pool.getConnection();
            try {
                const [rows]: any = await conn.execute(
                    'SELECT action, details, agent_id, timestamp FROM pnr_history WHERE pnr_locator = ? ORDER BY timestamp ASC',
                    [locator]
                );

                return rows.map((row: any) => {
                    const time = new Date(row.timestamp).toISOString().replace('T', ' ').substring(0, 19);
                    return `${time}  ${row.agent_id.padEnd(6)}  ${row.action.padEnd(15)} ${row.details}`;
                });
            } finally {
                conn.release();
            }
        } catch (err) {
            console.error(`❌ Failed to get history for ${locator}:`, err);
            return [];
        }
    }
}
