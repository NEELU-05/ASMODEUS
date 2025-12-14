import { pool } from './mysql.js';

export async function initDatabase() {
    console.log('🔄 Initializing Database Schema...');
    const conn = await pool.getConnection();

    try {
        // 1. Airports
        await conn.query(`
      CREATE TABLE IF NOT EXISTS airports (
        code CHAR(3) PRIMARY KEY,
        city VARCHAR(50),
        name VARCHAR(100)
      )
    `);

        // 2. Flights
        await conn.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        airline CHAR(2),
        flight_number VARCHAR(4),
        origin CHAR(3),
        destination CHAR(3),
        dep_time CHAR(4), -- 1000
        arr_time CHAR(4), -- 1300
        days VARCHAR(7) -- 1234567 (Frequency)
      )
    `);

        // 3. Inventory (Per date)
        await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        flight_id INT,
        date DATE,
        class CHAR(1), -- Y, J, F
        seats_available INT,
        seats_sold INT DEFAULT 0,
        FOREIGN KEY (flight_id) REFERENCES flights(id)
      )
    `);

        // 4. PNR
        await conn.query(`
      CREATE TABLE IF NOT EXISTS pnr (
        record_locator CHAR(6) PRIMARY KEY, -- ABC123
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        agent_id VARCHAR(20),
        status VARCHAR(10) DEFAULT 'ACTIVE'
      )
    `);

        // 5. Passengers
        await conn.query(`
      CREATE TABLE IF NOT EXISTS passengers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pnr_locator CHAR(6),
        last_name VARCHAR(50),
        first_name VARCHAR(50),
        type CHAR(3),
        FOREIGN KEY (pnr_locator) REFERENCES pnr(record_locator)
      )
    `);

        // 6. Segments (Booked)
        await conn.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pnr_locator CHAR(6),
        flight_id INT,
        date DATE,
        class CHAR(1),
        status CHAR(2), -- HK, HL, XX
        pax_count INT,
        FOREIGN KEY (pnr_locator) REFERENCES pnr(record_locator)
      )
    `);

        // 7. Tickets
        await conn.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        ticket_number VARCHAR(13) PRIMARY KEY,
        pnr_locator CHAR(6),
        passenger_id INT,
        status VARCHAR(10) DEFAULT 'OPEN',
        FOREIGN KEY (pnr_locator) REFERENCES pnr(record_locator)
      )
    `);

        console.log('✅ Database Schema initialized.');
    } catch (err) {
        console.error('❌ Schema initialization failed:', err);
    } finally {
        conn.release();
    }
}
