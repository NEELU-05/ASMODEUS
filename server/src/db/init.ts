import { pool } from './mysql.js';

export async function initDatabase() {
    console.log('🔄 Initializing Database Schema...');
    const conn = await pool.getConnection();

    try {
        // Airlines
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS airlines (
                code CHAR(2) PRIMARY KEY,
                name VARCHAR(100)
            )
        `);

        // Airports
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS airports (
                code CHAR(3) PRIMARY KEY,
                city VARCHAR(100),
                name VARCHAR(200)
            )
        `);

        // Flights
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS flights (
                id INT AUTO_INCREMENT PRIMARY KEY,
                airline CHAR(2),
                flight_number VARCHAR(10),
                origin CHAR(3),
                destination CHAR(3),
                dep_time CHAR(4),
                arr_time CHAR(4),
                days CHAR(7)
            )
        `);

        // Inventory
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                flight_id INT,
                class CHAR(1),
                seats INT
            )
        `);

        // PNRs
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS pnrs (
                locator CHAR(6) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Passengers
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS passengers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pnr_locator CHAR(6),
                last_name VARCHAR(50),
                first_name VARCHAR(50),
                type VARCHAR(3)
            )
        `);

        // Segments
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS segments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pnr_locator CHAR(6),
                airline CHAR(2),
                flight_number VARCHAR(10),
                class CHAR(1),
                origin CHAR(3),
                destination CHAR(3),
                dep_date DATE,
                status VARCHAR(10)
            )
        `);

        // Remarks
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS remarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pnr_locator CHAR(6),
                text VARCHAR(255)
            )
        `);

        // OSI
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS osi (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pnr_locator CHAR(6),
                text VARCHAR(255)
            )
        `);

        // Tickets
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS tickets (
                ticket_number VARCHAR(20) PRIMARY KEY,
                pnr_locator CHAR(6),
                passenger_name VARCHAR(100),
                amount DECIMAL(10,2),
                agent_id VARCHAR(10),
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Agent Sessions
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS agent_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(50),
                agent_id VARCHAR(10),
                sign_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sign_out_time TIMESTAMP NULL
            )
        `);

        // Command Logs
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS command_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(50),
                command_type VARCHAR(50),
                raw_command TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database Schema initialized.');
    } catch (err) {
        console.error('❌ Database init error:', err);
    } finally {
        conn.release();
    }
}
