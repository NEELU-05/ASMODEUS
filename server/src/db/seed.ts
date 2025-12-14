import { pool } from './mysql';

export async function seedData() {
    console.log('🌱 Seeding Dummy Data...');
    const conn = await pool.getConnection();

    try {
        // Clear old data (optional, for reset)
        // await conn.query('DELETE FROM inventory');
        // await conn.query('DELETE FROM flights');
        // await conn.query('DELETE FROM airports');

        // Airports
        const airports = [
            ['DEL', 'Delhi', 'Indira Gandhi International'],
            ['BOM', 'Mumbai', 'Chhatrapati Shivaji Maharaj'],
            ['DXB', 'Dubai', 'Dubai International'],
            ['DOH', 'Doha', 'Hamad International'],
            ['JFK', 'New York', 'John F. Kennedy'],
            ['LHR', 'London', 'Heathrow'],
            ['ATH', 'Athens', 'Eleftherios Venizelos'],
            ['LGW', 'London', 'Gatwick']
        ];

        for (const apt of airports) {
            await conn.query('INSERT IGNORE INTO airports (code, city, name) VALUES (?, ?, ?)', apt);
        }

        // Airlines Table Creation
        await conn.query(`CREATE TABLE IF NOT EXISTS airlines (code CHAR(2) PRIMARY KEY, name VARCHAR(50))`);
        const airlines = [
            ['AI', 'Air India'], ['IX', 'Air India Express'], ['UK', 'Vistara'], ['6E', 'IndiGo'],
            ['SG', 'SpiceJet'], ['G8', 'Go First'], ['QR', 'Qatar Airways'], ['EK', 'Emirates'],
            ['EY', 'Etihad Airways'], ['BA', 'British Airways'], ['LH', 'Lufthansa'], ['AF', 'Air France'],
            ['KL', 'KLM'], ['SQ', 'Singapore Airlines'], ['CX', 'Cathay Pacific'], ['JL', 'Japan Airlines'],
            ['NH', 'All Nippon Airways'], ['UA', 'United Airlines'], ['AA', 'American Airlines'],
            ['DL', 'Delta Air Lines'], ['AC', 'Air Canada'], ['TK', 'Turkish Airlines'], ['SV', 'Saudia'],
            ['MS', 'EgyptAir'], ['QF', 'Qantas'], ['NZ', 'Air New Zealand'], ['IB', 'Iberia'],
            ['AZ', 'ITA Airways'], ['LX', 'SWISS'], ['MH', 'Malaysia Airlines'], ['TG', 'Thai Airways'],
            ['GA', 'Garuda Indonesia'], ['KE', 'Korean Air'], ['OZ', 'Asiana Airlines'], ['HU', 'Hainan Airlines'],
            ['MU', 'China Eastern'], ['CA', 'Air China'], ['CZ', 'China Southern'], ['ET', 'Ethiopian Airlines'],
            ['AT', 'Royal Air Maroc'], ['RJ', 'Royal Jordanian'], ['A3', 'Aegean Airlines'], ['OA', 'Olympic Air'],
            ['U2', 'EasyJet']
        ];

        for (const al of airlines) {
            await conn.query('INSERT IGNORE INTO airlines (code, name) VALUES (?, ?)', al);
        }

        // Flights
        // DEL -> DXB (AI 995, EK 511)
        const flights = [
            ['AI', '995', 'DEL', 'DXB', '2000', '2200', '1234567'],
            ['EK', '511', 'DEL', 'DXB', '1000', '1230', '1234567'],
            ['QR', '579', 'DEL', 'DOH', '0400', '0600', '1234567'],
            ['UK', '999', 'BOM', 'LHR', '1400', '1900', '1357'],
            // ATH -> LON (LHR/LGW) matches screenshot
            ['BA', '631', 'ATH', 'LHR', '0815', '1010', '1234567'],
            ['A3', '602', 'ATH', 'LHR', '0850', '1050', '1234567'],
            ['OA', '259', 'ATH', 'LHR', '0915', '1115', '1234567'],
            ['BA', '639', 'ATH', 'LHR', '1340', '1535', '1234567'],
            ['U2', '5086', 'ATH', 'LGW', '1440', '1625', '1234567']
        ];

        for (const flt of flights) {
            await conn.query('INSERT IGNORE INTO flights (airline, flight_number, origin, destination, dep_time, arr_time, days) VALUES (?, ?, ?, ?, ?, ?, ?)', flt);
        }

        // Parameters for inventory generation: Next 30 days
        // We need to fetch flight IDs first
        const [rows]: any = await conn.query('SELECT id, days FROM flights');

        // Simple naive Loop for next 30 days
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // JS Sunday is 0, we want 7? Or adjust string. 
            // Our string is '1234567' where 1=Mon? Or 1=Sun? Let's assume 1=Mon.
            // JS: 1=Mon, ..., 6=Sat, 0=Sun. 
            // Conversion: 
            const jsDay = date.getDay();
            const dbDay = jsDay === 0 ? 7 : jsDay;

            const isoDate = date.toISOString().split('T')[0];

            for (const flight of rows) {
                if (flight.days.includes(String(dbDay))) {
                    // Create Inventory for Y, J classes
                    // Check if exists
                    const [check]: any = await conn.query('SELECT id FROM inventory WHERE flight_id=? AND date=?', [flight.id, isoDate]);
                    if (check.length === 0) {
                        await conn.query('INSERT INTO inventory (flight_id, date, class, seats_available) VALUES (?, ?, "Y", 100)', [flight.id, isoDate]);
                        await conn.query('INSERT INTO inventory (flight_id, date, class, seats_available) VALUES (?, ?, "J", 10)', [flight.id, isoDate]); // Small J class for scenarios
                    }
                }
            }
        }

        console.log('✅ Seed Data Inserted.');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        conn.release();
    }
}
