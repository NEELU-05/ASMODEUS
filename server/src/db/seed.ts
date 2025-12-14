import { pool } from './mysql.js';

async function seedData() {
    console.log('🌱 Seeding Database...');
    const conn = await pool.getConnection();

    try {
        // Create airlines table
        await conn.execute(`CREATE TABLE IF NOT EXISTS airlines (code CHAR(2) PRIMARY KEY, name VARCHAR(50))`);

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
            ['AT', 'Royal Air Maroc'], ['RJ', 'Royal Jordanian'], ['A3', 'Aegean Airlines'], ['OA', 'Olympic Air']
        ];

        for (const al of airlines) {
            await conn.execute('INSERT IGNORE INTO airlines (code, name) VALUES (?, ?)', al);
        }

        console.log(`✅ Seeded ${airlines.length} airlines`);

        // Sample airports
        await conn.execute(`CREATE TABLE IF NOT EXISTS airports (code CHAR(3) PRIMARY KEY, city VARCHAR(50), name VARCHAR(100))`);

        const airports = [
            ['DEL', 'Delhi', 'Indira Gandhi International'],
            ['BOM', 'Mumbai', 'Chhatrapati Shivaji'],
            ['BLR', 'Bangalore', 'Kempegowda International'],
            ['MAA', 'Chennai', 'Chennai International'],
            ['HYD', 'Hyderabad', 'Rajiv Gandhi International'],
            ['CCU', 'Kolkata', 'Netaji Subhas Chandra Bose'],
            ['AMD', 'Ahmedabad', 'Sardar Vallabhbhai Patel'],
            ['COK', 'Kochi', 'Cochin International'],
            ['GOI', 'Goa', 'Dabolim'],
            ['TRV', 'Thiruvananthapuram', 'Trivandrum International'],
            ['DOH', 'Doha', 'Hamad International'],
            ['DXB', 'Dubai', 'Dubai International'],
            ['AUH', 'Abu Dhabi', 'Zayed International'],
            ['LHR', 'London', 'Heathrow'],
            ['LGW', 'London', 'Gatwick'],
            ['STN', 'London', 'Stansted'],
            ['MAN', 'Manchester', 'Manchester'],
            ['JFK', 'New York', 'John F Kennedy'],
            ['EWR', 'Newark', 'Liberty International'],
            ['LGA', 'New York', 'LaGuardia'],
            ['SIN', 'Singapore', 'Changi'],
            ['BKK', 'Bangkok', 'Suvarnabhumi'],
            ['HKG', 'Hong Kong', 'Hong Kong International'],
            ['HND', 'Tokyo', 'Haneda'],
            ['NRT', 'Tokyo', 'Narita'],
            ['ICN', 'Seoul', 'Incheon'],
            ['KUL', 'Kuala Lumpur', 'Kuala Lumpur International'],
            ['ATH', 'Athens', 'Athens International'],
            ['FRA', 'Frankfurt', 'Frankfurt'],
            ['MUC', 'Munich', 'Munich'],
            ['CDG', 'Paris', 'Charles de Gaulle'],
            ['AMS', 'Amsterdam', 'Schiphol'],
            ['MAD', 'Madrid', 'Barajas'],
            ['BCN', 'Barcelona', 'El Prat'],
            ['FCO', 'Rome', 'Fiumicino'],
            ['ZRH', 'Zurich', 'Zurich'],
            ['VIE', 'Vienna', 'Vienna International'],
            ['IST', 'Istanbul', 'Istanbul'],
            ['LAX', 'Los Angeles', 'Los Angeles International'],
            ['SFO', 'San Francisco', 'San Francisco International'],
            ['ORD', 'Chicago', 'O Hare International'],
            ['ATL', 'Atlanta', 'Hartsfield-Jackson'],
            ['DFW', 'Dallas', 'Fort Worth'],
            ['MIA', 'Miami', 'Miami International'],
            ['YYZ', 'Toronto', 'Pearson'],
            ['YVR', 'Vancouver', 'Vancouver International'],
            ['SYD', 'Sydney', 'Kingsford Smith'],
            ['MEL', 'Melbourne', 'Tullamarine']
        ];

        for (const ap of airports) {
            await conn.execute('INSERT IGNORE INTO airports (code, city, name) VALUES (?, ?, ?)', ap);
        }

        console.log(`✅ Seeded ${airports.length} airports`);

        // Sample flights
        await conn.execute(`CREATE TABLE IF NOT EXISTS flights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            airline CHAR(2),
            flight_number VARCHAR(10),
            origin CHAR(3),
            destination CHAR(3),
            dep_time CHAR(4),
            arr_time CHAR(4),
            days CHAR(7)
        )`);

        const flights = [
            ['AI', '631', 'DEL', 'BOM', '0850', '1050', '1234567'],
            ['6E', '234', 'DEL', 'BOM', '1200', '1400', '1234567'],
            ['UK', '851', 'DEL', 'BLR', '0900', '1130', '1234567'],
            ['QR', '570', 'DEL', 'DOH', '0200', '0430', '1234567'],
            ['EK', '512', 'DEL', 'DXB', '0300', '0530', '1234567'],
            ['BA', '142', 'DEL', 'LHR', '1400', '1830', '1234567']
        ];

        for (const flt of flights) {
            await conn.execute('INSERT IGNORE INTO flights (airline, flight_number, origin, destination, dep_time, arr_time, days) VALUES (?, ?, ?, ?, ?, ?, ?)', flt);
        }

        console.log(`✅ Seeded ${flights.length} flights`);

    } catch (err) {
        console.error('❌ Seed error:', err);
    } finally {
        conn.release();
    }
}

seedData().then(() => process.exit());
