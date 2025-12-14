import { CommandIntent, CommandType, FlightSegment, Passenger } from './types.js';
import { Session } from './Session.js';
import { AvailabilityService } from './AvailabilityService.js';
import { pool } from '../db/mysql.js';

import { PnrService } from './PnrService.js';
import { TicketService } from './TicketService.js';
import { LoggerService } from './LoggerService.js';

export class CommandProcessor {
    static async process(session: Session, intent: CommandIntent): Promise<string> {
        // Log all commands
        await LoggerService.logCommand(session.sessionId, intent.type, intent.raw);

        // Validate Session State (except for sign-in)
        if (!session.signedIn && intent.type !== CommandType.SIGN_IN) {
            return "SECURED AREA - PLEASE SIGN IN";
        }

        try {
            switch (intent.type) {
                // ===== SESSION =====
                case CommandType.SIGN_IN:
                    return this.handleSignIn(session, intent.args);

                case CommandType.SIGN_OUT:
                    return this.handleSignOut(session);

                // ===== AVAILABILITY & SCHEDULE =====
                case CommandType.AVAILABILITY:
                    return await AvailabilityService.search(session, intent.args.rawParams, intent.args.direct);

                case CommandType.SCHEDULE:
                    // Schedule = Availability without seat counts
                    const scheduleResult = await AvailabilityService.search(session, intent.args.rawParams, intent.args.direct);
                    return scheduleResult.replace(/[A-Z]\d/g, '--'); // Remove seat counts

                case CommandType.MOVE_DOWN:
                    return AvailabilityService.moveDown(session);

                case CommandType.MOVE_UP:
                    return AvailabilityService.moveUp(session);

                case CommandType.MOVE_TOP:
                    return AvailabilityService.moveTop(session);

                case CommandType.MOVE_BOTTOM:
                    return AvailabilityService.moveBottom(session);

                case CommandType.AVAILABILITY_CHANGE:
                    return await AvailabilityService.changeDate(session, intent.args.newDate);

                case CommandType.MOVE_NEXT_DAY:
                    return await AvailabilityService.moveNextDay(session, intent.args.days);

                case CommandType.MOVE_PREVIOUS_DAY:
                    return await AvailabilityService.movePreviousDay(session, intent.args.days);

                case CommandType.TIMETABLE:
                    return await AvailabilityService.getTimetable(session, intent.args.rawParams);

                // ===== BOOKING =====
                case CommandType.SELL:
                    return await this.handleSell(session, intent.args);

                case CommandType.NEED:
                    return await this.handleNeed(session, intent.args);

                case CommandType.RECONFIRM:
                    return "RR - RECONFIRM (NOT YET IMPLEMENTED)";

                case CommandType.NAME:
                    return this.handleName(session, intent.args);

                case CommandType.CHANGE_NAME:
                    return this.handleChangeName(session, intent.args);

                case CommandType.CONTACT:
                    return this.handleContact(session, intent.args);

                case CommandType.SSR:
                    return this.handleSSR(session, intent.args);

                case CommandType.TICKETING_ELEMENT:
                    return this.handleTicketingElement(session, intent.args);

                case CommandType.SEAT_REQUEST:
                    return this.handleSeatRequest(session, intent.args);

                case CommandType.SEAT_MAP:
                    return this.handleSeatMap(session, intent.args);

                // ===== PRICING & TICKETING =====
                case CommandType.FARE_QUOTE:
                    return "FQ - FARE QUOTE (NOT YET IMPLEMENTED)";

                case CommandType.PRICE:
                    return await this.handlePrice(session, intent.args);

                case CommandType.REBOOK_PRICE:
                    return "FXB - REBOOK & PRICE (NOT YET IMPLEMENTED)";

                case CommandType.TICKET:
                    return await this.handleTicket(session, intent.args);

                case CommandType.TICKET_DISPLAY:
                    return await this.handleTicketDisplay(session);

                // ===== PNR OPERATIONS =====
                case CommandType.RETRIEVE:
                    return await this.handleRetrieve(session, intent.args);

                case CommandType.END_RETRIEVE:
                    return await this.handleEndRetrieve(session);

                case CommandType.END_TRANSACTION:
                    return await this.handleEndTransaction(session);

                case CommandType.IGNORE:
                    session.reset();
                    return "IG - WORKING AREA CLEARED";

                // ===== MODIFICATIONS =====
                case CommandType.CANCEL_SEGMENT:
                    return this.handleCancelSegment(session, intent.args);

                case CommandType.CANCEL_ITINERARY:
                    return this.handleCancelItinerary(session);

                case CommandType.CANCEL_NAME:
                    return this.handleCancelName(session, intent.args);

                case CommandType.SPLIT_PNR:
                    return await this.handleSplitPnr(session, intent.args);

                // ===== HISTORY & QUEUE =====
                case CommandType.HISTORY:
                    return "RH - HISTORY (NOT YET IMPLEMENTED)";

                case CommandType.QUEUE_START:
                case CommandType.QUEUE_DISPLAY:
                case CommandType.QUEUE_EXIT:
                    return "QUEUE OPERATIONS (NOT YET IMPLEMENTED)";

                // ===== MISCELLANEOUS =====
                case CommandType.OSI:
                    session.area.osi.push(intent.args.osiText);
                    return `OSI ${intent.args.osiText} - ADDED`;

                case CommandType.REMARK:
                    session.area.remarks.push(intent.args.remarkText);
                    return `RM ${intent.args.remarkText} - ADDED`;

                case CommandType.RECEIVED_FROM:
                    return "RC - RECEIVED FROM (NOT YET IMPLEMENTED)";

                case CommandType.HELP:
                    return this.handleHelp(intent.args.topic);

                case CommandType.UNKNOWN:
                default:
                    return "CHECK ENTRY";
            }
        } catch (err: any) {
            console.error('Command Processing Error:', err);
            return `SYSTEM ERROR: ${err.message}`;
        }
    }

    // ===== SIGN IN/OUT =====
    private static async handleSignIn(session: Session, args: any): Promise<string> {
        if (session.signedIn) {
            return "ALREADY SIGNED IN";
        }
        const agentId = args.agentId || "AGENT";
        session.signIn(agentId);
        await LoggerService.logSessionStart(session.sessionId, agentId);

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase().replace(/ /g, '');
        const timeStr = now.toTimeString().substring(0, 5).replace(':', '') + 'Z';

        return `OK ${agentId} - ASMODEUS READY\n${dateStr} ${timeStr}`;
    }

    private static async handleSignOut(session: Session): Promise<string> {
        await LoggerService.logSessionEnd(session.sessionId);
        session.signOut();
        return "SIGNED OUT";
    }

    // ===== SELL =====
    private static async handleSell(session: Session, args: any): Promise<string> {
        const { numSeats, bookingClass, lineNumber } = args;

        // Check if availability results exist
        if (!session.area.availabilityResults || session.area.availabilityResults.length === 0) {
            return "NO AVAILABILITY IN WORKING AREA";
        }

        // Check line number
        if (lineNumber < 1 || lineNumber > session.area.availabilityResults.length) {
            return "INVALID LINE NUMBER";
        }

        const flight = session.area.availabilityResults[lineNumber - 1];

        // Check class availability
        if (!flight.classes[bookingClass] || flight.classes[bookingClass] < numSeats) {
            return "NO SEATS AVAILABLE";
        }

        // Add segment to working area
        const segment: FlightSegment = {
            line: session.area.segments.length + 1,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            class: bookingClass,
            date: '12JAN', // TODO: Use actual date from availability
            origin: flight.origin,
            dest: flight.destination,
            status: `HK${numSeats}`,
            seats: numSeats,
            depTime: flight.depTime,
            arrTime: flight.arrTime
        };

        session.area.segments.push(segment);

        // Format Segment Response (Fixed Width)
        // 1  AI 631 Y 12JAN DELBOM HK1  0850 1050 /E
        const lineStr = segment.line.toString().padEnd(3);
        const al = segment.airline.padEnd(3);
        const fn = segment.flightNumber.padEnd(4);
        const cls = segment.class.padEnd(2);
        const dt = segment.date.padEnd(6);
        const od = (segment.origin + segment.dest).padEnd(7);
        const st = segment.status.padEnd(5);
        const t1 = segment.depTime ? segment.depTime.replace(':', '').padEnd(5) : '     ';
        const t2 = segment.arrTime ? segment.arrTime.replace(':', '').padEnd(5) : '     ';

        return `${lineStr}${al}${fn}${cls}${dt}${od}${st}${t1}${t2}/E`;
    }

    // ===== NEED =====
    private static async handleNeed(session: Session, args: any): Promise<string> {
        const { numSeats, bookingClass, lineNumber } = args;

        if (!session.area.availabilityResults || session.area.availabilityResults.length === 0) {
            return "NO AVAILABILITY IN WORKING AREA";
        }

        if (lineNumber < 1 || lineNumber > session.area.availabilityResults.length) {
            return "INVALID LINE NUMBER";
        }

        const flight = session.area.availabilityResults[lineNumber - 1];

        const segment: FlightSegment = {
            line: session.area.segments.length + 1,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            class: bookingClass,
            date: '12JAN',
            origin: flight.origin,
            dest: flight.destination,
            status: `NN${numSeats}`,
            seats: numSeats
        };

        session.area.segments.push(segment);

        return `${segment.line}  ${segment.airline} ${segment.flightNumber} ${segment.class} ${segment.date} ${segment.origin}${segment.dest} ${segment.status}`;
    }

    // ===== NAME =====
    private static handleName(session: Session, args: any): string {
        const nameField = args.nameField; // e.g., "1KUMAR/RAHUL MR"

        // Parse: NM1KUMAR/RAHUL MR
        const match = nameField.match(/^(\d+)([A-Z]+)\/([A-Z\s]+)$/);
        if (!match) {
            return "INVALID NAME FORMAT";
        }

        const numPax = parseInt(match[1]);
        const lastName = match[2];
        const firstNameAndTitle = match[3].trim();
        const parts = firstNameAndTitle.split(' ');
        const firstName = parts[0];

        for (let i = 0; i < numPax; i++) {
            const passenger: Passenger = {
                line: session.area.passengers.length + 1,
                lastName,
                firstName,
                type: 'ADT'
            };
            session.area.passengers.push(passenger);
        }

        return `${session.area.passengers.length}.${lastName}/${firstName}`;
    }

    // ===== CONTACT =====
    private static handleContact(session: Session, args: any): string {
        session.area.contacts.push(args.contactField);
        return `AP ${args.contactField} - ADDED`;
    }

    // ===== SSR =====
    private static handleSSR(session: Session, args: any): string {
        session.area.ssrs.push(args.ssrCode);
        return `SR ${args.ssrCode} - ADDED`;
    }

    // ===== TICKETING ELEMENT =====
    private static handleTicketingElement(session: Session, args: any): string {
        const element = args.element;
        // Basic validation: TK OK or TK TL
        session.area.ticketing.push(element);
        return `TK ${element} - ADDED`;
    }

    // ===== PRICE =====
    private static async handlePrice(session: Session, args: any): Promise<string> {
        if (session.area.segments.length === 0) {
            return "NO ITIN";
        }

        if (session.area.passengers.length === 0) {
            return "NEED NAME FIELD";
        }

        // Generate random fare
        const baseFare = Math.floor(Math.random() * 50000) + 10000;
        const tax = Math.floor(baseFare * 0.15);
        const total = baseFare + tax;

        session.area.pricedFare = total;

        let output = "FARE CALCULATION\n";
        output += `BASE FARE:  INR ${baseFare.toLocaleString()}\n`;
        output += `TAXES:      INR ${tax.toLocaleString()}\n`;
        output += `TOTAL:      INR ${total.toLocaleString()}\n`;
        output += `PAX: ${session.area.passengers.length} ADT\n`;

        return output;
    }

    // ===== TICKET =====
    private static async handleTicket(session: Session, args: any): Promise<string> {
        if (!session.area.currentPnr) {
            return "NO PNR IN CONTEXT";
        }

        // Check if Ticket Element exists (TK OK)
        if (session.area.ticketing.length === 0) {
            return "NO TICKETING ARRANGEMENT";
        }

        if (!session.area.pricedFare) {
            return "PNR NOT PRICED";
        }

        // Generate ticket number
        const ticketNumber = `176-${Math.floor(Math.random() * 1000000000)}`;

        // Save Ticket
        const paxName = session.area.passengers.length > 0
            ? `${session.area.passengers[0].lastName}/${session.area.passengers[0].firstName}`
            : 'UNKNOWN';

        await TicketService.issueTicket({
            ticketNumber,
            pnrLocator: session.area.currentPnr,
            passengerName: paxName,
            amount: session.area.pricedFare,
            agentId: session.agentId
        });

        let output = "TICKET ISSUED\n";
        output += `TKT: ${ticketNumber}\n`;
        output += `PNR: ${session.area.currentPnr}\n`;
        output += `FARE: INR ${session.area.pricedFare.toLocaleString()}\n`;

        return output;
    }

    // ===== TICKET DISPLAY =====
    private static async handleTicketDisplay(session: Session): Promise<string> {
        if (!session.area.currentPnr) {
            return "NO PNR IN CONTEXT";
        }
        return "TWD - TICKET DISPLAY (NOT YET IMPLEMENTED)";
    }



    // ===== END & RETRIEVE =====
    private static async handleEndRetrieve(session: Session): Promise<string> {
        // Mandatory Elements Check
        if (session.area.segments.length === 0) return "NO ITIN";
        if (session.area.passengers.length === 0) return "NEED NAME FIELD";
        if (session.area.contacts.length === 0) return "NEED AP ELEMENT";
        if (session.area.ticketing.length === 0) return "NEED TK ELEMENT";

        // Generate PNR locator
        const locator = this.generatePNRLocator();
        session.area.currentPnr = locator;

        // Save to Database
        await PnrService.createPnr(locator, session.area.passengers, session.area.segments, session.area.remarks, session.area.osi);

        // Format PNR display
        let output = `PNR CREATED: ${locator}\n\n`;

        // Passengers
        session.area.passengers.forEach(pax => {
            output += `${pax.line}.${pax.lastName}/${pax.firstName} ${pax.type}\n`;
        });
        output += "\n";

        // Segments
        session.area.segments.forEach(seg => {
            // 1  AI 631 Y 12JAN DELBOM HK1  0850 1050 /E
            const lineStr = seg.line.toString().padEnd(3);
            const al = seg.airline.padEnd(3);
            const fn = seg.flightNumber.padEnd(4);
            const cls = seg.class.padEnd(2);
            const dt = seg.date.padEnd(6);
            const od = (seg.origin + seg.dest).padEnd(7);
            const st = seg.status.padEnd(5);
            const t1 = seg.depTime ? seg.depTime.replace(':', '').padEnd(5) : '     ';
            const t2 = seg.arrTime ? seg.arrTime.replace(':', '').padEnd(5) : '     ';

            output += `${lineStr}${al}${fn}${cls}${dt}${od}${st}${t1}${t2}/E\n`;
        });
        output += "\n";

        // Contacts
        if (session.area.contacts.length > 0) {
            session.area.contacts.forEach(contact => {
                output += `AP ${contact}\n`;
            });
        }

        // Remarks
        if (session.area.remarks.length > 0) {
            session.area.remarks.forEach(rm => {
                output += `RM ${rm}\n`;
            });
        }

        // OSI
        if (session.area.osi.length > 0) {
            session.area.osi.forEach(o => {
                output += `OSI ${o}\n`;
            });
        }

        return output;
    }

    // ===== END TRANSACTION =====
    private static async handleEndTransaction(session: Session): Promise<string> {
        if (session.area.segments.length === 0) return "NO ITIN";
        if (session.area.passengers.length === 0) return "NEED NAME FIELD";
        if (session.area.contacts.length === 0) return "NEED AP ELEMENT";
        if (session.area.ticketing.length === 0) return "NEED TK ELEMENT";

        const locator = this.generatePNRLocator();
        session.area.currentPnr = locator;

        // Save to Database
        const saved = await PnrService.createPnr(locator, session.area.passengers, session.area.segments, session.area.remarks, session.area.osi);
        const dbMsg = saved ? "" : " (LOCAL ONLY - DB ERROR)";

        return `PNR SAVED: ${locator}${dbMsg}`;
    }

    // ===== RETRIEVE =====
    private static async handleRetrieve(session: Session, args: any): Promise<string> {
        const pnr = args.pnr;

        if (!pnr) {
            // Retrieve current PNR
            if (!session.area.currentPnr) {
                return "NO PNR IN CONTEXT";
            }
            return `RETRIEVING ${session.area.currentPnr}...`;
        }

        // 1. Check if in session memory (simple optimization, though session resets often)
        if (session.area.currentPnr === pnr) {
            // Already loaded
        }

        // 2. Try to retrieve from DB
        const dbPnr = await PnrService.retrievePnr(pnr);

        if (dbPnr) {
            session.area.currentPnr = pnr;
            session.area.passengers = dbPnr.passengers;
            session.area.segments = dbPnr.segments;
            session.area.remarks = dbPnr.remarks;
            session.area.osi = dbPnr.osi;

            // Format Display
            let output = `PNR RETRIEVED: ${pnr}\n\n`;
            dbPnr.passengers.forEach(pax => output += `${pax.line}.${pax.lastName}/${pax.firstName} ${pax.type}\n`);
            output += "\n";
            dbPnr.segments.forEach(seg => {
                // 1  AI 631 Y 12JAN DELBOM HK1  0850 1050 /E
                // Note: DB retrieved segments might lack depTime/arrTime if not originally saved, handling gracefully
                const lineStr = seg.line.toString().padEnd(3);
                const al = seg.airline.padEnd(3);
                const fn = seg.flightNumber.padEnd(4);
                const cls = seg.class.padEnd(2);
                const dt = seg.date.padEnd(6);
                const od = (seg.origin + seg.dest).padEnd(7);
                const st = seg.status.padEnd(5);
                // Types for DB PNR might be loose, let's type cast or check if exist
                const s = seg as any;
                const t1 = s.depTime ? s.depTime.replace(':', '').padEnd(5) : '     ';
                const t2 = s.arrTime ? s.arrTime.replace(':', '').padEnd(5) : '     ';

                output += `${lineStr}${al}${fn}${cls}${dt}${od}${st}${t1}${t2}/E\n`;
            });
            output += "\n";

            // Assume no contacts saved in DB yet (Task didn't specify Contact persistence, but ideally yes. Skip for now to stick to scope)

            if (dbPnr.remarks && dbPnr.remarks.length > 0) {
                dbPnr.remarks.forEach(rm => output += `RM ${rm}\n`);
            }
            if (dbPnr.osi && dbPnr.osi.length > 0) {
                dbPnr.osi.forEach(o => output += `OSI ${o}\n`);
            }

            return output;
        }

        return `PNR ${pnr} NOT FOUND`;
    }

    // ===== CANCEL SEGMENT =====
    private static handleCancelSegment(session: Session, args: any): string {
        const segNum = args.segmentNumber;

        if (session.area.segments.length === 0) {
            return "NO ITIN";
        }

        if (segNum < 1 || segNum > session.area.segments.length) {
            return "INVALID SEGMENT NUMBER";
        }

        session.area.segments.splice(segNum - 1, 1);

        // Renumber remaining segments
        session.area.segments.forEach((seg, idx) => {
            seg.line = idx + 1;
        });

        return `SEGMENT ${segNum} CANCELLED`;
    }

    // ===== CANCEL ITINERARY =====
    private static handleCancelItinerary(session: Session): string {
        session.area.segments = [];
        return "ITINERARY CANCELLED";
    }

    // ===== CANCEL NAME =====
    private static handleCancelName(session: Session, args: any): string {
        const nameNum = args.nameNumber;

        if (session.area.passengers.length === 0) {
            return "NO NAMES";
        }

        if (nameNum < 1 || nameNum > session.area.passengers.length) {
            return "INVALID NAME NUMBER";
        }

        session.area.passengers.splice(nameNum - 1, 1);

        // Renumber
        session.area.passengers.forEach((pax, idx) => {
            pax.line = idx + 1;
        });

        return `NAME ${nameNum} CANCELLED`;
    }

    // ===== HELP =====
    private static handleHelp(topic?: string): string {
        if (!topic) {
            return `
ASMODEUS HELP SYSTEM
--------------------
ENTER HE <TOPIC> FOR MORE INFO.

TOPICS:
  SIGN, AVAIL, SELL, NAME, CONT,
  PNR, PRICE, TKT, QUEUE, HIST
`;
        }

        const t = topic.toUpperCase();
        if (t.startsWith("SIGN")) return "SIGN IN: JI <ID>/<OFFICE>\nSIGN OUT: JO";
        if (t.startsWith("AVAIL")) return "AVAILABILITY: AN <DATE><ORG><DEST>\nSCROLL: MD/MU/MT/MB\nCHANGE DATE: AC <DATE>\nNEXT/PREV DAY: MN/MY";
        if (t.startsWith("SELL")) return "SELL SEAT: SS <QTY><CLS><LINE>\nEX: SS1Y1";
        if (t.startsWith("NAME")) return "ADD NAME: NM <QTY><LAST>/<FIRST> <TITLE>\nEX: NM1SMITH/JOHN MR";
        if (t.startsWith("CONT")) return "CONTACT: AP <CITY> <PHONE>\nEX: AP DEL 9999999999";
        if (t.startsWith("PNR")) return "SAVE: ER (END & RETRIEVE)\nIGNORE: IG\nRETRIEVE: RT <LOCATOR>";
        if (t.startsWith("PRICE")) return "PRICE PNR: FXP\nBEST BUY: FXB (TODO)";
        if (t.startsWith("TKT")) return "ISSUE TICKET: TTP\nADD TIME LIMIT: TKTL <DATE>\nADD ELEMENT: TK OK";
        if (t.startsWith("QUEUE")) return "START: QS <Q_NUM>\nDISPLAY: QD\nEXIT: QE";
        if (t.startsWith("HIST")) return "HISTORY: RH\nFULL HISTORY: RHA";

        return `UNKNOWN TOPIC: ${topic}\nTRY 'HE' FOR LIST OF TOPICS`;
    }

    // ===== CHANGE NAME =====
    private static handleChangeName(session: Session, args: any): string {
        const { line, lastName, firstName } = args;
        if (line < 1 || line > session.area.passengers.length) {
            return "INVALID NAME LINE";
        }

        const pax = session.area.passengers[line - 1];
        pax.lastName = lastName;
        pax.firstName = firstName;

        return `${line}.${lastName}/${firstName}`;
    }

    // ===== SPLIT PNR =====
    private static async handleSplitPnr(session: Session, args: any): Promise<string> {
        const paxNum = args.passengerNumber;

        if (session.area.passengers.length === 0) {
            return "NO NAMES";
        }

        if (paxNum < 1 || paxNum > session.area.passengers.length) {
            return "INVALID PASSENGER";
        }

        const splitPax = session.area.passengers[paxNum - 1];
        session.area.passengers.splice(paxNum - 1, 1);

        // Renumber remaining passengers
        session.area.passengers.forEach((p, i) => {
            p.line = i + 1;
        });

        const newLocator = this.generatePNRLocator();

        // In a real system, we would create a new PNR record here.
        // For simulation, we assume it's filed.

        return `SPLIT PNR\nORIGINAL PNR RETAINED\nNEW PNR CREATED: ${newLocator}\nPASSENGER: ${splitPax.lastName}/${splitPax.firstName}`;
    }

    // ===== SEATS =====
    private static handleSeatRequest(session: Session, args: any): string {
        const req = args.request;
        session.area.seats.push(req);
        return `ST ${req} - REQUEST PROCESSED`;
    }

    private static handleSeatMap(session: Session, args: any): string {
        return `
       A   B   C       D   E   F
 10    .   .   .       .   .   .
 11    .   X   X       .   .   .
 12    .   .   .       .   .   .
 13    .   .   .       .   .   .
`;
    }

    // ===== UTILITIES =====
    private static generatePNRLocator(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let locator = '';
        for (let i = 0; i < 6; i++) {
            locator += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return locator;
    }
}
