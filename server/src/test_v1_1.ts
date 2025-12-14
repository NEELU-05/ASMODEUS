import { CommandProcessor } from './engine/CommandProcessor.js';
import { Session } from './engine/Session.js';
import { CommandIntent, CommandType } from './engine/types.js';

// Mock Command Parser (simplified for test)
function parseCommand(cmd: string): CommandIntent {
    const parts = cmd.trim().toUpperCase().split(' ');
    const code = parts[0];
    const args = parts.slice(1).join(' '); // Simple join
    let type = CommandType.UNKNOWN;
    let finalArgs: any = {};

    if (code === 'JI') { type = CommandType.SIGN_IN; finalArgs = { agentId: 'TEST' }; }
    else if (code.startsWith('AN')) { type = CommandType.AVAILABILITY; finalArgs = { rawParams: code.substring(2) || "12JANDELDOH", direct: false }; }
    else if (code === 'MD') { type = CommandType.MOVE_DOWN; }
    else if (code === 'MU') { type = CommandType.MOVE_UP; }
    else if (code.startsWith('SS')) { type = CommandType.SELL; finalArgs = { numSeats: 1, bookingClass: 'Y', lineNumber: 1 }; }
    else if (code.startsWith('NM')) { type = CommandType.NAME; finalArgs = { nameField: code.substring(2) }; } // NM1DOE/JOHN
    else if (code.startsWith('AP')) { type = CommandType.CONTACT; finalArgs = { contactField: args }; }
    else if (code.startsWith('RM')) { type = CommandType.REMARK; finalArgs = { remarkText: args }; }
    else if (code === 'OSI') { type = CommandType.OSI; finalArgs = { osiText: args }; }
    else if (code === 'ER') { type = CommandType.END_RETRIEVE; }
    else if (code.startsWith('RT')) { type = CommandType.RETRIEVE; finalArgs = { pnr: code.substring(2) }; }
    else if (code === 'IG') { type = CommandType.IGNORE; }

    return { type, raw: cmd, args: finalArgs };
}

import { initDatabase } from './db/init.js';

async function runTest() {
    await initDatabase(); // Ensure tables exist
    console.log("🚀 STARTING INTEGRATION TEST (v1.1 Features)...");
    const session = new Session("test-session-1");

    const commands = [
        "JI",
        "AN12JANDELDOH", // Search
        "MD",            // Test Pagination (Down)
        "MU",            // Test Pagination (Up)
        "SS1Y1",         // Sell Seat
        "NM1TEST/USER",  // Add Name
        "AP 999-123",    // Add Contact
        "RM CLIENT PREFERS AISLE", // Add Remark (New v1.1)
        "OSI YY VIP PAX",          // Add OSI (New v1.1)
        "ER"             // End & Retrieve (Save to DB)
    ];

    let pnr = "";

    for (const cmd of commands) {
        console.log(`\n> ${cmd}`);
        const intent = parseCommand(cmd);
        const result = await CommandProcessor.process(session, intent);
        console.log(result);

        if (cmd === "ER") {
            // Extract PNR from output: "PNR CREATED: XXXXXX"
            const match = result.match(/PNR CREATED: ([A-Z0-9]{6})/);
            if (match) {
                pnr = match[1];
                console.log(`\n✅ CAPTURED PNR: ${pnr}`);
            } else {
                console.error("❌ FAILED TO CAPTURE PNR");
            }
        }
    }

    if (pnr) {
        console.log(`\n> IG (Clear Session)`);
        await CommandProcessor.process(session, parseCommand("IG"));

        console.log(`\n> RT${pnr} (Retrieve from DB)`);
        const rtResult = await CommandProcessor.process(session, parseCommand(`RT${pnr}`));
        console.log(rtResult);

        // Verify Content
        if (rtResult.includes("RM CLIENT PREFERS AISLE") && rtResult.includes("OSI YY VIP PAX")) {
            console.log("\n✅ SUCCESS: Remarks and OSI persisted and retrieved!");
        } else {
            console.log("\n❌ ALLURE: Remarks or OSI missing from retrieval.");
        }
    } else {
        console.log("\n❌ SKIPPING RETRIEVE TEST (No PNR)");
    }

    process.exit(0);
}

runTest().catch(console.error);
