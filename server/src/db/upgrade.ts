import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { pool } from './mysql';

async function upgradeDB() {
    console.log('🚀 Upgrading Database...');
    const conn = await pool.getConnection();

    try {
        // 1. Airports from CSV
        const csvPath = path.join(__dirname, '../../archive/airport-codes_csv.csv');
        if (fs.existsSync(csvPath)) {
            console.log('Reading Airport CSV...');
            const fileContent = fs.readFileSync(csvPath, 'utf-8');
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            });

            console.log(`Found ${records.length} airports. Filtering...`);
            let count = 0;
            for (const row of records) {
                // Filter: Must have IATA code, and be medium or large airport
                if (row.iata_code && row.iata_code.length === 3 && (row.type === 'large_airport' || row.type === 'medium_airport')) {
                    await conn.query(
                        `INSERT IGNORE INTO airports (code, city, name) VALUES (?, ?, ?)`,
                        [row.iata_code, row.municipality || row.name, row.name]
                    );
                    count++;
                }
            }
            console.log(`✅ Inserted/Verified ${count} Airports.`);
        }

        // 2. Airlines from Code List (Hardcoded for now based on user request)
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
        console.log(`✅ Inserted ${airlines.length} Airlines.`);

    } catch (err) {
        console.error('❌ Upgrade Failed:', err);
    } finally {
        conn.release();
    }
}

upgradeDB().then(() => process.exit());
