import { CommandIntent, CommandType } from './types.js';

export class CommandParser {
    static parse(input: string): CommandIntent {
        const cmd = input.trim().toUpperCase();

        // Sign In: JI1234 or JI1234/AG
        if (cmd.match(/^JI/)) {
            const parts = cmd.substring(2).split('/');
            return {
                type: CommandType.SIGN_IN,
                raw: input,
                args: { agentId: parts[0] || 'AGENT', office: parts[1] || 'AG' }
            };
        }

        // Sign Out: JO
        if (cmd === 'JO') {
            return { type: CommandType.SIGN_OUT, raw: input, args: {} };
        }

        // Availability Neutral: AN12JANDELDOH or ANDELDOH
        if (cmd.match(/^AN/)) {
            return {
                type: CommandType.AVAILABILITY,
                raw: input,
                args: { rawParams: cmd.substring(2), direct: false }
            };
        }

        // Availability Direct: AD12JANDELDOH
        if (cmd.match(/^AD/)) {
            return {
                type: CommandType.AVAILABILITY,
                raw: input,
                args: { rawParams: cmd.substring(2), direct: true }
            };
        }

        // Schedule Neutral: SN12JANDELDOH
        if (cmd.match(/^SN/)) {
            return {
                type: CommandType.SCHEDULE,
                raw: input,
                args: { rawParams: cmd.substring(2), direct: false }
            };
        }

        // Schedule Direct: SD12JANDELDOH
        if (cmd.match(/^SD/)) {
            return {
                type: CommandType.SCHEDULE,
                raw: input,
                args: { rawParams: cmd.substring(2), direct: true }
            };
        }

        // Move Down: MD
        if (cmd === 'MD') {
            return { type: CommandType.MOVE_DOWN, raw: input, args: {} };
        }

        // Move Up: MU
        if (cmd === 'MU') {
            return { type: CommandType.MOVE_UP, raw: input, args: {} };
        }

        // Sell: SS1Y1 (1 seat, class Y, line 1)
        if (cmd.match(/^SS(\d+)([A-Z])(\d+)$/)) {
            const match = cmd.match(/^SS(\d+)([A-Z])(\d+)$/);
            return {
                type: CommandType.SELL,
                raw: input,
                args: {
                    numSeats: parseInt(match![1]),
                    bookingClass: match![2],
                    lineNumber: parseInt(match![3])
                }
            };
        }

        // Need: NN1Y1
        if (cmd.match(/^NN(\d+)([A-Z])(\d+)$/)) {
            const match = cmd.match(/^NN(\d+)([A-Z])(\d+)$/);
            return {
                type: CommandType.NEED,
                raw: input,
                args: {
                    numSeats: parseInt(match![1]),
                    bookingClass: match![2],
                    lineNumber: parseInt(match![3])
                }
            };
        }

        // Reconfirm: RR1Y1
        if (cmd.match(/^RR(\d+)([A-Z])(\d+)$/)) {
            const match = cmd.match(/^RR(\d+)([A-Z])(\d+)$/);
            return {
                type: CommandType.RECONFIRM,
                raw: input,
                args: {
                    numSeats: parseInt(match![1]),
                    bookingClass: match![2],
                    lineNumber: parseInt(match![3])
                }
            };
        }

        // Name: NM1KUMAR/RAHUL MR
        if (cmd.match(/^NM/)) {
            return {
                type: CommandType.NAME,
                raw: input,
                args: { nameField: cmd.substring(2) }
            };
        }

        // Name Change: 1/NewLast/NewFirst
        if (cmd.match(/^(\d+)\/([A-Z]+)\/([A-Z\s]+)$/)) {
            const match = cmd.match(/^(\d+)\/([A-Z]+)\/([A-Z\s]+)$/);
            return {
                type: CommandType.CHANGE_NAME,
                raw: input,
                args: {
                    line: parseInt(match![1]),
                    lastName: match![2],
                    firstName: match![3].trim()
                }
            };
        }

        // Contact: AP MUM 9876543210
        if (cmd.match(/^AP\s/)) {
            return {
                type: CommandType.CONTACT,
                raw: input,
                args: { contactField: cmd.substring(3) }
            };
        }

        // SSR: SR VGML or SR WCHR
        if (cmd.match(/^SR\s/)) {
            return {
                type: CommandType.SSR,
                raw: input,
                args: { ssrCode: cmd.substring(3) }
            };
        }

        // Seat Request: ST/12A
        if (cmd.match(/^ST/)) {
            return {
                type: CommandType.SEAT_REQUEST,
                raw: input,
                args: { request: cmd.substring(2) }
            };
        }

        // Seat Map: SM2 or SM
        if (cmd.match(/^SM/)) {
            return {
                type: CommandType.SEAT_MAP,
                raw: input,
                args: { request: cmd.substring(2) }
            };
        }

        // Ticketing Element: TKOK or TKTL/20JAN
        if (cmd.match(/^TK/)) {
            return {
                type: CommandType.TICKETING_ELEMENT,
                raw: input,
                args: { element: cmd.substring(2) }
            };
        }

        // Fare Quote Display: FQDEL BOM or FQD DEL BOM
        if (cmd.match(/^FQ[D]?/)) {
            return {
                type: CommandType.FARE_QUOTE,
                raw: input,
                args: { fareParams: cmd }
            };
        }

        // Price: FXP
        if (cmd === 'FXP' || cmd.match(/^FXP\//)) {
            return {
                type: CommandType.PRICE,
                raw: input,
                args: { priceParams: cmd.substring(3) }
            };
        }

        // Rebook & Price: FXB
        if (cmd === 'FXB') {
            return {
                type: CommandType.REBOOK_PRICE,
                raw: input,
                args: {}
            };
        }

        // Ticket: TTP
        if (cmd === 'TTP' || cmd.match(/^TTP\//)) {
            return {
                type: CommandType.TICKET,
                raw: input,
                args: { ticketParams: cmd.substring(3) }
            };
        }

        // Ticket Display: TWD
        if (cmd === 'TWD') {
            return {
                type: CommandType.TICKET_DISPLAY,
                raw: input,
                args: {}
            };
        }

        // Retrieve: RT ABC123
        if (cmd.match(/^RT\s?([A-Z0-9]+)?$/)) {
            const match = cmd.match(/^RT\s?([A-Z0-9]+)?$/);
            return {
                type: CommandType.RETRIEVE,
                raw: input,
                args: { pnr: match![1] || '' }
            };
        }

        // End & Retrieve: ER
        if (cmd === 'ER') {
            return { type: CommandType.END_RETRIEVE, raw: input, args: {} };
        }

        // End Transaction: ET
        if (cmd === 'ET') {
            return { type: CommandType.END_TRANSACTION, raw: input, args: {} };
        }

        // Ignore: IG or IR
        if (cmd === 'IG' || cmd === 'IR') {
            return { type: CommandType.IGNORE, raw: input, args: {} };
        }

        // Cancel Segment: XE1
        if (cmd.match(/^XE(\d+)$/)) {
            const match = cmd.match(/^XE(\d+)$/);
            return {
                type: CommandType.CANCEL_SEGMENT,
                raw: input,
                args: { segmentNumber: parseInt(match![1]) }
            };
        }

        // Cancel Itinerary: XI
        if (cmd === 'XI') {
            return { type: CommandType.CANCEL_ITINERARY, raw: input, args: {} };
        }

        // Cancel Name: XN1
        if (cmd.match(/^XN(\d+)$/)) {
            const match = cmd.match(/^XN(\d+)$/);
            return {
                type: CommandType.CANCEL_NAME,
                raw: input,
                args: { nameNumber: parseInt(match![1]) }
            };
        }

        // Split PNR: SP1
        if (cmd.match(/^SP(\d+)$/)) {
            const match = cmd.match(/^SP(\d+)$/);
            return {
                type: CommandType.SPLIT_PNR,
                raw: input,
                args: { passengerNumber: parseInt(match![1]) }
            };
        }

        // History: RH or RHA
        if (cmd === 'RH' || cmd === 'RHA') {
            return {
                type: CommandType.HISTORY,
                raw: input,
                args: { full: cmd === 'RHA' }
            };
        }

        // Queue: QS, QD, QE
        if (cmd === 'QS') {
            return { type: CommandType.QUEUE_START, raw: input, args: {} };
        }
        if (cmd === 'QD') {
            return { type: CommandType.QUEUE_DISPLAY, raw: input, args: {} };
        }
        if (cmd === 'QE') {
            return { type: CommandType.QUEUE_EXIT, raw: input, args: {} };
        }

        // OSI: OSI YY TEXT
        if (cmd.match(/^OSI\s/)) {
            return {
                type: CommandType.OSI,
                raw: input,
                args: { osiText: cmd.substring(4) }
            };
        }

        // Remark: RM TEXT
        if (cmd.match(/^RM\s/)) {
            return {
                type: CommandType.REMARK,
                raw: input,
                args: { remarkText: cmd.substring(3) }
            };
        }

        // Received From: RC
        if (cmd === 'RC') {
            return { type: CommandType.RECEIVED_FROM, raw: input, args: {} };
        }

        // Help: HE
        if (cmd === 'HE') {
            return { type: CommandType.HELP, raw: input, args: {} };
        }

        // Unknown
        return { type: CommandType.UNKNOWN, raw: input, args: {} };
    }
}
