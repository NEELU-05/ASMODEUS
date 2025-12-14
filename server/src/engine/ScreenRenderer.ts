
import { FlightSegment, Passenger } from './types.js';

export class ScreenRenderer {

    // ===== PNR SEGMENTS =====
    // 1  AI 631 Y 12JAN DELBOM HK1  0850 1050 /E
    static renderSegment(seg: FlightSegment): string {
        const lineStr = seg.line.toString().padStart(2) + " ";
        const al = seg.airline.padEnd(3);
        const fn = seg.flightNumber.padEnd(5);
        const cls = seg.class.padEnd(2);
        const dt = seg.date.padEnd(6); // 12JAN_
        const od = (seg.origin + seg.dest).padEnd(8); // DELBOM__
        const st = (seg.status || "HK1").padEnd(5); // HK1__

        let t1 = "     ";
        let t2 = "     ";
        if (seg.depTime) t1 = seg.depTime.replace(':', '').padEnd(5);
        if (seg.arrTime) t2 = seg.arrTime.replace(':', '').padEnd(5);

        // Optional parts based on real display 
        // Real: 2  9W 123 Y 15DEC DELBOM HK1  1000 1200   *       1A/E
        // We'll stick to: Line AL FN Cls Date OrigDest Stat Dep Arr /E

        return `${lineStr}${al}${fn}${cls}${dt}${od}${st}${t1}${t2}/E`;
    }

    // ===== PASSENGERS =====
    // 1.SMITH/JOHN MR
    static renderPassenger(pax: Passenger): string {
        return `${pax.line.toString().padStart(2)}.${pax.lastName}/${pax.firstName} ${pax.type !== 'ADT' ? '(' + pax.type + ')' : ''}`;
    }

    // ===== CONTACTS =====
    // AP DEL 99999999
    // Amadeus often shows: 
    // 5 AP DEL 2435678 - BUSINESS - A
    // For now we just stick to prefix spacing
    static renderContact(contact: string): string {
        // Handle input that might naturally lack space if parser didn't catch it
        // But parser usually splits AP and text.
        // We ensure consistent indention if in PNR list?
        // Actually AP elements in PNR list usually have line numbers if they are associated or system elements.
        // But in basic simulation we listed them as "AP ..."
        // Let's assume standard "AP <TEXT>"
        return `AP ${contact.toUpperCase()}`;
    }

    // ===== PNR HEADER =====
    static renderPnrHeader(locator: string): string {
        return `--- TST RLR ---                          RP/DEL1A0980/1234            ${locator}`;
    }

    // ===== FULL PNR =====
    static renderPnr(
        locator: string | null,
        passengers: Passenger[],
        segments: FlightSegment[],
        contacts: string[],
        ticketing: string[],
        remarks: string[],
        osi: string[]
    ): string {
        if (!locator && passengers.length === 0 && segments.length === 0) {
            return "NO PNR IN CONTEXT";
        }

        const locStr = locator ? `  LOC: ${locator}` : '  NO RECORD LOCATOR';

        let output = "";

        if (locator) {
            output += this.renderPnrHeader(locator) + "\n";
        }

        // PNR Header/Name section usually top
        if (passengers.length > 0) {
            passengers.forEach(p => output += this.renderPassenger(p) + "\n");
        }

        // Segments
        if (segments.length > 0) {
            segments.forEach(s => output += this.renderSegment(s) + "\n");
        }

        // Elements
        contacts.forEach((c, i) => output += `${(8 + i)} ${this.renderContact(c)}\n`); // Mock line numbers strictly
        ticketing.forEach((t, i) => output += `${(11 + i)} TK ${t}\n`);
        remarks.forEach(r => output += `RM ${r}\n`);
        osi.forEach(o => output += `OSI ${o}\n`);

        return output;
    }
}
