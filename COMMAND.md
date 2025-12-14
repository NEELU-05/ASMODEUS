# ASMODEUS Project Source Code

## Root Configuration

### `package.json`
```json
{
  "name": "asmodeus-selling-platform",
  "version": "1.0.0",
  "description": "Dummy Amadeus Selling Platform Connect",
  "scripts": {
    "install-all": "npm install --prefix server && npm install --prefix client",
    "build-client": "npm run build --prefix client",
    "build-server": "npm run build --prefix server",
    "build": "npm run install-all && npm run build-client && npm run build-server",
    "start": "node server/dist/index.js",
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\""
  },
  "dependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Server (`server/`)

### `server/package.json`
```json
{
  "name": "asmodeus-server",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mysql2": "^3.6.5"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.4",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### `server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### `server/src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { CommandParser } from './engine/CommandParser';
import { CommandProcessor } from './engine/CommandProcessor';
import { Session } from './engine/Session';

// Force load env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Session Store
const sessions = new Map<string, Session>();

// API Route
app.post('/api/command', async (req: any, res: any) => {
  const { command, sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  // Get or Create Session
  let session = sessions.get(sessionId);
  if (!session) {
    session = new Session(sessionId);
    sessions.set(sessionId, session);
  }

  console.log(`[${sessionId}] Command: ${command}`);

  // Parse
  const intent = CommandParser.parse(command);

  // Process
  const responseText = await CommandProcessor.process(session, intent);

  res.json({
    response: responseText,
    data: {
        area: session.area
    }
  });
});

// Serve Frontend (Production/Render)
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

import { SCENARIOS } from './scenarios/data';

app.get('/api/scenarios', (req: any, res: any) => {
    res.json(SCENARIOS);
});

app.get('*', (req: any, res: any) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### `server/src/engine/types.ts`
```typescript
export interface CommandIntent {
  raw: string;
  type: CommandType;
  success: boolean;
  args: any;
  error?: string;
}

export enum CommandType {
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  AVAILABILITY = 'AVAILABILITY',
  SELL = 'SELL',
  CANCEL_SEGMENT = 'CANCEL_SEGMENT',
  ADD_NAME = 'ADD_NAME',
  ADD_PHONE = 'ADD_PHONE',
  RECEIVED_FROM = 'RECEIVED_FROM',
  END_TRANSACTION = 'END_TRANSACTION',
  IGNORE = 'IGNORE',
  RETRIEVE_PNR = 'RETRIEVE_PNR',
  PRICING = 'PRICING',
  TICKETING = 'TICKETING',
  DISPLAY_PNR = 'DISPLAY_PNR',
  UNKNOWN = 'UNKNOWN',
  DISPLAY_TICKET = 'DISPLAY_TICKET',
  VOID_TICKET = 'VOID_TICKET',
}

export interface FlightSegment {
  line: number; // 1, 2, 3
  airline: string;
  flightNumber: string;
  class: string;
  date: string; // DDMMM
  origin: string;
  dest: string;
  status: string; // HK1, HL1
  seats: number;
}

export interface Passenger {
  line: number;
  lastName: string;
  firstName: string;
  type: 'ADT' | 'CHD' | 'INF';
}
```

### `server/src/engine/Session.ts`
```typescript
import { FlightSegment, Passenger } from './types';

export class Session {
    id: string;
    agentId: string | null = null;
    signedIn: boolean = false;
    area: string = 'A';
    
    // Working Area
    availabilityResults: any[] = []; // Cache of last AN response
    segments: FlightSegment[] = [];
    passengers: Passenger[] = [];
    contacts: string[] = [];
    receivedFrom: string | null = null;
    
    currentPnr: string | null = null; // If retrieved
    
    constructor(id: string) {
        this.id = id;
    }

    reset() {
        this.segments = [];
        this.passengers = [];
        this.contacts = [];
        this.receivedFrom = null;
        this.currentPnr = null;
    }

    signIn(agentId: string) {
        this.agentId = agentId;
        this.signedIn = true;
        this.reset();
    }

    signOut() {
        this.agentId = null;
        this.signedIn = false;
        this.reset();
    }
}
```

### `server/src/engine/CommandParser.ts`
```typescript
import { CommandIntent, CommandType } from './types';

export class CommandParser {
  static parse(input: string): CommandIntent {
    const cleanInput = input.toUpperCase().trim();
    
    // 1. Sign In (JI) - JI1234/AG
    if (cleanInput.startsWith('JI')) {
      return {
        raw: cleanInput,
        type: CommandType.SIGN_IN,
        success: true,
        args: { agentId: cleanInput.substring(2).split('/')[0] }
      };
    }

    // 2. Sign Out (JO)
    if (cleanInput === 'JO') {
      return { raw: cleanInput, type: CommandType.SIGN_OUT, success: true, args: {} };
    }

    // 3. Availability (AN) - AN12JANDELDOH
    if (cleanInput.startsWith('AN')) {
        return {
            raw: cleanInput,
            type: CommandType.AVAILABILITY,
            success: true,
            args: { rawParams: cleanInput.substring(2) }
        };
    }

    // 4. Sell (SS) - SS1Y1
    if (cleanInput.startsWith('SS')) {
        const match = cleanInput.match(/^SS(\d+)([A-Z])(\d+)$/);
        if (match) {
            return {
                raw: cleanInput,
                type: CommandType.SELL,
                success: true,
                args: { qty: parseInt(match[1]), class: match[2], line: parseInt(match[3]) }
            };
        }
    }

    // 5. Name (NM) - NM1JONES/TIM
    if (cleanInput.startsWith('NM')) {
        return {
            raw: cleanInput,
            type: CommandType.ADD_NAME,
            success: true,
            args: { rawName: cleanInput.substring(2) }
        };
    }

    // 6. End Transaction (ER)
    if (cleanInput === 'ER') {
        return { raw: cleanInput, type: CommandType.END_TRANSACTION, success: true, args: {} };
    }
    
    // 7. Ignore (IR)
    if (cleanInput === 'IR' || cleanInput === 'IG') {
        return { raw: cleanInput, type: CommandType.IGNORE, success: true, args: {} };
    }

    // 8. Retrieve (RT)
    if (cleanInput.startsWith('RT')) {
      return {
        raw: cleanInput,
        type: CommandType.RETRIEVE_PNR,
        success: true,
        args: { pnr: cleanInput.substring(2) }
      };
    }

    // 9. Pricing (FXP)
    if (cleanInput === 'FXP') {
       return { raw: cleanInput, type: CommandType.PRICING, success: true, args: {} };
    }
    
    // 10. Ticketing (TTP)
    if (cleanInput === 'TTP' || cleanInput === 'TKOK') {
        return { raw: cleanInput, type: CommandType.TICKETING, success: true, args: {} };
    }

    return {
      raw: cleanInput,
      type: CommandType.UNKNOWN,
      success: false,
      error: 'UNKNOWN COMMAND',
      args: {}
    };
  }
}
```

### `server/src/engine/CommandProcessor.ts`
```typescript
import { CommandIntent, CommandType } from './types';
import { Session } from './Session';

export class CommandProcessor {
  static async process(session: Session, intent: CommandIntent): Promise<string> {
    
    // 1. Validate Session State
    if (!session.signedIn && intent.type !== CommandType.SIGN_IN) {
        return "SECURED AREA - PLEASE SIGN IN";
    }

    try {
        switch (intent.type) {
            case CommandType.SIGN_IN:
                return this.handleSignIn(session, intent.args);
            case CommandType.SIGN_OUT:
                return this.handleSignOut(session);
            case CommandType.AVAILABILITY:
                return "AVAILABILITY DISPLAY - TODO"; 
            case CommandType.SELL:
                return "SEGMENT SOLD - TODO";
            case CommandType.IGNORE:
                 session.reset();
                 return "IG";
            case CommandType.UNKNOWN:
            default:
                return "CHECK ENTRY";
        }
    } catch (err: any) {
        console.error(err);
        return "SYSTEM ERROR";
    }
  }

  private static handleSignIn(session: Session, args: any): string {
    if (session.signedIn) {
        return "ALREADY SIGNED IN";
    }
    const agentId = args.agentId || "AGENT";
    session.signIn(agentId);
    return `OK ${agentId} - ASMODEUS READY\n14DEC25 1000Z`; // Mock time
  }

  private static handleSignOut(session: Session): string {
    session.signOut();
    return "SIGNED OUT";
  }
}
```

### `server/src/engine/AvailabilityService.ts`
```typescript
import { pool } from '../db/mysql';

export class AvailabilityService {
    static async search(cmdArgs: string): Promise<string> {
        let dateStr = "12JAN"; 
        let origin = "DEL";
        let dest = "DOH";

        // Regex for DDMMMORGDEST (e.g. 18SEPATHLON)
        const longMatch = cmdArgs.match(/^(\d{2}[A-Z]{3})([A-Z]{3})([A-Z]{3})$/);
        // Regex for ORGDEST (e.g. ATHLON)
        const shortMatch = cmdArgs.match(/^([A-Z]{3})([A-Z]{3})$/);

        if (longMatch) {
            dateStr = longMatch[1];
            origin = longMatch[2];
            dest = longMatch[3];
        } else if (shortMatch) {
             origin = shortMatch[1];
             dest = shortMatch[2];
        }

        // Map City Codes to Airports (Cheap Mock)
        const cityMap: any = {
            'LON': ['LHR', 'LGW', 'LCY', 'STN'],
            'NYC': ['JFK', 'EWR', 'LGA'],
            'PAR': ['CDG', 'ORY'],
            'TYO': ['NRT', 'HND'],
            'ATH': ['ATH']
        };

        const dests = cityMap[dest] || [dest];
        const origins = cityMap[origin] || [origin];

        const flights = await this.queryFlights(origins, dests);

        if (flights.length === 0) {
            return `NO FLIGHTS FOUND FOR ${origin} -> ${dest}`;
        }

        return this.formatResponse(flights, dateStr, origin, dest);
    }

    private static async queryFlights(origins: string[], dests: string[]) {
        try {
            if (origins.length === 0 || dests.length === 0) return [];
            
            const originPlaceholders = origins.map(() => '?').join(',');
            const destPlaceholders = dests.map(() => '?').join(',');
            
            const query = `
                SELECT f.*, a.name as airline_name 
                FROM flights f 
                LEFT JOIN airlines a ON f.airline = a.code 
                WHERE f.origin IN (${originPlaceholders}) AND f.destination IN (${destPlaceholders})
            `;
            
            const [rows]: any = await pool.query(query, [...origins, ...dests]);
            return rows;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    private static formatResponse(flights: any[], dateStr: string, origin: string, dest: string): string {
        // Precise header match
        // ** AMADEUS AVAILABILITY - AN ** LON LONDON.GB                   58 SA 18SEP 0000
        const header = `** AMADEUS AVAILABILITY - AN ** ${dest} ${this.getCityName(dest).padEnd(15)}       58 SA ${dateStr} 0000`;
        let body = "";

        flights.forEach((flt, index) => {
            const lineNum = (index + 1).toString();
            const al = flt.airline;
            const fn = flt.flight_number;
            const dep = flt.dep_time; 
            const arr = flt.arr_time; 
            const aircraft = "321"; 
            const duration = "4:00"; 
            const terminal = "1"; 

            const classesObj = this.getMockInventory(flt.id);
            const classList = this.getClassList(classesObj); 
            
            // Chunk classes: 7 per line approximately
            const row1Classes = classList.slice(0, 7).join(" ");
            
            // Space Align
            const lineStr = lineNum.padEnd(3); 
            const fltStr = `${al} ${fn}`.padEnd(7); 
            const classStr = row1Classes.padEnd(20);
            const routeStr = `/${flt.origin}   ${flt.destination} ${terminal}`; 
            const timeStr = `${dep.padEnd(7)} ${arr}`; 
            const equipStr = `E0/${aircraft}`;
            
            const row1 = `${lineStr} ${fltStr} ${classStr} ${routeStr}  ${timeStr}   ${equipStr}       ${duration}`;
            body += row1 + "\n";

            // Row 2: Remaining classes
            const row2Classes = classList.slice(7).join(" ");
            if (row2Classes) {
                 const indent = " ".repeat(12); 
                 body += `${indent}${row2Classes}\n`;
            }
        });

        return `${header}\n${body}`;
    }

    private static getClassList(inv: any): string[] {
        const order = ['J', 'C', 'D', 'R', 'I', 'Y', 'B', 'H', 'K', 'M', 'L', 'V', 'S'];
        const list: string[] = [];
        for (const cls of order) {
             list.push(`${cls}${inv[cls] ?? 0}`);
        }
        return list;
    }

    private static getCityName(code: string): string {
        const map: any = { 'DEL': 'DELHI', 'DOH': 'DOHA', 'LHR': 'LONDON', 'DXB': 'DUBAI', 'JFK': 'NEW YORK', 'BOM': 'MUMBAI', 'ATH': 'ATHENS', 'LON': 'LONDON' };
        return map[code] || code;
    }

    private static getMockInventory(flightId: number): any {
        return {
            J: 9, C: 9, D: 9, R: 9, I: 4, 
            Y: 9, B: 9, H: 9, K: 9, M: 9, L: 9, V: 4, S: 4
        };
    }
}
```

### `server/src/db/init.ts`
```typescript
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
```

### `server/src/db/seed.ts`
```typescript
import { pool } from './mysql.js';

export async function seedData() {
  console.log('🌱 Seeding Dummy Data...');
  const conn = await pool.getConnection();

  try {
    // Airports
    const airports = [
        ['DEL', 'Delhi', 'Indira Gandhi International'],
        ['BOM', 'Mumbai', 'Chhatrapati Shivaji Maharaj'],
        ['DXB', 'Dubai', 'Dubai International'],
        ['DOH', 'Doha', 'Hamad International'],
        ['JFK', 'New York', 'John F. Kennedy'],
        ['LHR', 'London', 'Heathrow']
    ];

    for (const apt of airports) {
        await conn.query('INSERT IGNORE INTO airports (code, city, name) VALUES (?, ?, ?)', apt);
    }

    // Flights
    // DEL -> DXB (AI 995, EK 511)
    const flights = [
        ['AI', '995', 'DEL', 'DXB', '2000', '2200', '1234567'],
        ['EK', '511', 'DEL', 'DXB', '1000', '1230', '1234567'],
        ['QR', '579', 'DEL', 'DOH', '0400', '0600', '1234567'], // For the scenario
        ['UK', '999', 'BOM', 'LHR', '1400', '1900', '1357']
    ];

    for (const flt of flights) {
        await conn.query('INSERT IGNORE INTO flights (airline, flight_number, origin, destination, dep_time, arr_time, days) VALUES (?, ?, ?, ?, ?, ?, ?)', flt);
    }

    // Parameters for inventory generation: Next 30 days
    const [rows]: any = await conn.query('SELECT id, days FROM flights');
    
    // Simple naive Loop for next 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        const jsDay = date.getDay();
        const dbDay = jsDay === 0 ? 7 : jsDay; 

        const isoDate = date.toISOString().split('T')[0];

        for (const flight of rows) {
            if (flight.days.includes(String(dbDay))) {
                // Create Inventory for Y, J classes
                const [check]: any = await conn.query('SELECT id FROM inventory WHERE flight_id=? AND date=?', [flight.id, isoDate]);
                if (check.length === 0) {
                    await conn.query('INSERT INTO inventory (flight_id, date, class, seats_available) VALUES (?, ?, "Y", 100)', [flight.id, isoDate]);
                    await conn.query('INSERT INTO inventory (flight_id, date, class, seats_available) VALUES (?, ?, "J", 10)', [flight.id, isoDate]); 
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
```

### `server/src/scenarios/data.ts`
```typescript
export interface Scenario {
  id: number;
  title: string;
  description: string;
  setup?: string[]; // Commands to auto-run to set up state
  goal: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Basic Booking",
    description: "Book 1 passenger from DEL to DOH on 12 JAN, price the booking and issue the ticket.",
    goal: "Ticket a PNR for DEL-DOH"
  },
  {
    id: 2,
    title: "Class Error",
    description: "While booking DEL -> DOH (12 JAN), you selected an invalid booking class. Correct the error and complete the booking.",
    goal: "Recover from 'INVALID CLASS' error"
  },
  {
    id: 3,
    title: "Inventory Check",
    description: "Attempt to book more seats than available in Business class for DEL -> DOH (12 JAN) and handle the system response.",
    goal: "Handle availability limits"
  },
  {
    id: 4,
    title: "Multi-PAX",
    description: "Create a 2-passenger booking on the same flight from DEL -> DOH (12 JAN) and issue tickets.",
    goal: "Ticket 2 PAX PNR"
  },
  {
      id: 5,
      title: "Missing Name",
      description: "You sold a segment but forgot to enter passenger name(s). Resolve the issue and successfully create the PNR.",
      goal: "Pass validation checks"
  },
  {
      id: 6,
      title: "Segment Correction",
      description: "You selected the wrong flight segment during selling. Cancel the incorrect segment and continue with the correct one.",
      goal: "Use XS/XE and SS"
  },
  {
      id: 7,
      title: "Discard Booking",
      description: "Discard an incorrect booking using the system without creating a PNR, then start a fresh booking.",
      goal: "Use IG (Ignore)"
  },
  {
      id: 8,
      title: "PNR Retrieval",
      description: "Retrieve an existing PNR, display all flight segments and passenger details.",
      goal: "Use RT and * commands"
  },
  {
      id: 9,
      title: "Pricing Check",
      description: "Attempt to issue a ticket without pricing the PNR. Identify the error and correct it.",
      goal: "Enforce TTP -> FXP dependency"
  },
  {
      id: 10,
      title: "Void Ticket",
      description: "Retrieve a ticketed PNR and void the issued ticket.",
      goal: "Use TRDC/TWX"
  },
  {
      id: 11,
      title: "Cancel & Release",
      description: "Cancel a sold flight segment before ticketing and verify that the seat is released.",
      goal: "Verify inventory release"
  },
  {
      id: 12,
      title: "Name Mismatch",
      description: "Book 2 passengers, but enter only one passenger name. Fix the issue and complete the booking.",
      goal: "Match NM quantity to SS quantity"
  },
  {
      id: 13,
      title: "Reprice",
      description: "Retrieve an existing PNR and reprice the booking before ticketing.",
      goal: "Update stored fare (TST)"
  },
  {
      id: 14,
      title: "Full Workflow",
      description: "Log in as an agent, perform a complete booking, then log out properly.",
      goal: "JI -> Booking -> JO"
  },
  {
      id: 15,
      title: "Blind Sell",
      description: "Attempt to sell a seat without checking availability first and handle the system response.",
      goal: "Enforce flow order or allow SS with warning"
  },
  {
      id: 16,
      title: "Invalid PNR",
      description: "Retrieve a PNR that does not exist and observe the system behavior.",
      goal: "Handle Not Found errors"
  },
  {
      id: 17,
      title: "Delayed Ticketing",
      description: "Book a flight, create the PNR, but do not ticket it. Retrieve the PNR and complete ticketing later.",
      goal: "Pending ticketing status"
  },
  {
      id: 18,
      title: "Ignore Changes",
      description: "Make a booking, then ignore the working area instead of saving it.",
      goal: "Clear Session without Saving"
  },
  {
      id: 19,
      title: "Ticket Display",
      description: "Retrieve a ticketed PNR and display ticket details.",
      goal: "View TWD/*T"
  },
  {
      id: 20,
      title: "Perfect Flow",
      description: "Perform a full clean booking flow (availability -> sell -> name -> PNR -> pricing -> ticket) without any errors.",
      goal: "Mastery"
  }
];
```

---

## Client (`client/`)

### `client/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### `client/src/App.tsx`
```typescript
import { useState, useEffect } from 'react';
import { CrypticTerminal } from './components/CrypticTerminal';

interface Scenario {
  id: number;
  title: string;
  description: string;
  goal: string;
}

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => setScenarios(data))
      .catch(console.error);
  }, []);

  return (
    <div className="h-screen w-screen p-4 flex gap-4 bg-[var(--bg-core)]">
       {/* Main Work Area */}
       <div className="w-2/3 h-full">
         <div className="h-8 mb-2 flex items-center justify-between">
            <h1 className="text-[var(--text-accent)] font-bold tracking-wider">AMADEUS <span className="text-white opacity-50">CONNECT</span></h1>
            <div className="text-xs text-gray-500">PRACTICE MODE</div>
         </div>
         <CrypticTerminal />
       </div>

       {/* Side Panel (Widgets) */}
       <div className="w-1/3 h-full flex flex-col gap-4">
          
          {/* Scenario List */}
          <div className="glass p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
             <h2 className="text-[var(--text-secondary)] mb-2 uppercase text-sm font-bold border-b border-gray-700 pb-1">Practice Scenarios</h2>
             <div className="space-y-2 text-sm text-gray-300 overflow-y-auto flex-1">
                {scenarios.map(s => (
                    <div 
                        key={s.id} 
                        onClick={() => setActiveScenario(s)}
                        className={`p-2 rounded cursor-pointer transition-colors ${activeScenario?.id === s.id ? 'bg-[var(--text-accent)] text-[var(--bg-core)] font-bold' : 'hover:bg-[var(--bg-input)]'}`}
                    >
                        {s.id}. {s.title}
                    </div>
                ))}
                {scenarios.length === 0 && <div className="text-gray-500 italic">Loading scenarios...</div>}
             </div>
          </div>
          
          {/* Active Scenario Details */}
          <div className="glass p-4 rounded-lg flex-1 overflow-y-auto">
             <h2 className="text-[var(--text-secondary)] mb-2 uppercase text-sm font-bold border-b border-gray-700 pb-1">Current Task</h2>
             {activeScenario ? (
                 <div className="text-sm">
                    <div className="mb-4">
                        <span className="text-[var(--text-accent)] font-bold">TASK:</span>
                        <p className="text-gray-300 mt-1 leading-relaxed">{activeScenario.description}</p>
                    </div>
                    <div>
                        <span className="text-green-500 font-bold">GOAL:</span>
                        <p className="text-gray-400 mt-1 font-mono text-xs">{activeScenario.goal}</p>
                    </div>
                 </div>
             ) : (
                 <div className="text-xs text-gray-500 text-center mt-10">
                    SELECT A SCENARIO TO BEGIN
                 </div>
             )}
          </div>
       </div>
    </div>
  );
}

export default App;
```

### `client/src/components/CrypticTerminal.tsx`
```typescript
import React, { useState, useEffect, useRef } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export const CrypticTerminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => 'SESS_' + Math.random().toString(36).substr(2, 9));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.toUpperCase();
    setHistory(prev => [...prev, { type: 'input', content: `> ${cmd}` }]);
    setInput('');

    try {
      // Use relative path - Vite proxy will handle dev, Express static will handle prod
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, sessionId })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setHistory(prev => [...prev, { type: 'error', content: data.error }]);
      } else {
        setHistory(prev => [...prev, { type: 'output', content: data.response }]);
      }
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', content: 'SYSTEM COMMUNICATION ERROR' }]);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-lg overflow-hidden p-4">
      <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm space-y-2">
        {history.length === 0 && (
          <div className="text-gray-500">
            AMADEUS SELLING PLATFORM CONNECT (SIMULATOR)<br/>
            ENTER 'JI' TO SIGN IN...
          </div>
        )}
        {history.map((line, i) => (
          <div key={i} className={`
            ${line.type === 'input' ? 'text-gray-400' : ''}
            ${line.type === 'output' ? 'terminal-text' : ''}
            ${line.type === 'error' ? 'text-red-500' : ''}
          `}>
             {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-700 pt-2">
        <span className="text-green-500 font-bold">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          className="input-field"
          autoFocus
          placeholder="ENTER COMMAND"
        />
      </form>
    </div>
  );
};
```

### `client/src/index.css`
```css
:root {
  --bg-core: #0f172a;
  --bg-panel: #1e293b;
  --bg-input: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-terminal: #4ade80; /* Neo Green */
  --text-error: #ef4444;
  --text-accent: #38bdf8; /* Sky Blue */
  --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-core);
  color: var(--text-primary);
  height: 100vh;
  overflow: hidden;
}

#root {
  height: 100%;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-core); 
}
::-webkit-scrollbar-thumb {
  background: var(--bg-input); 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary); 
}

/* Utilities */
.glass {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.terminal-text {
  font-family: var(--font-mono);
  color: var(--text-terminal);
  line-height: 1.5;
  white-space: pre-wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: var(--bg-input);
  color: var(--text-primary);
}

.btn:hover {
  background: var(--text-accent);
  color: var(--bg-core);
}

.input-field {
  background: transparent;
  border: none;
  font-family: var(--font-mono);
  color: var(--text-primary);
  outline: none;
  width: 100%;
  font-size: 1rem;
  text-transform: uppercase;
}

/* Layout Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.h-full { height: 100%; }
.h-screen { height: 100vh; }
.w-full { width: 100%; }
.w-screen { width: 100vw; }
.w-2\/3 { width: 66.666667%; }
.w-1\/3 { width: 33.333333%; }
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

/* Spacing */
.p-4 { padding: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.pt-2 { padding-top: 0.5rem; }
.pb-1 { padding-bottom: 0.25rem; }

/* Text */
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
.font-mono { font-family: var(--font-mono); }
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }

/* Colors */
.text-green-500 { color: var(--text-terminal); }
.text-gray-500 { color: var(--text-secondary); }
.text-gray-400 { color: #94a3b8; }
.text-gray-300 { color: #cbd5e1; }
.text-red-500 { color: var(--text-error); }
.text-white { color: #fff; }

/* Borders */
.border-t { border-top: 1px solid rgba(255,255,255,0.1); }
.border-b { border-bottom: 1px solid rgba(255,255,255,0.1); }
.border-gray-700 { border-color: rgba(255,255,255,0.1); }

/* Misc */
.rounded-lg { border-radius: 0.5rem; }
.opacity-50 { opacity: 0.5; }
```
