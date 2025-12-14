export interface CommandIntent {
    raw: string;
    type: CommandType;
    success?: boolean;
    args: any;
    error?: string;
}

export enum CommandType {
    // Session
    SIGN_IN = 'SIGN_IN',
    SIGN_OUT = 'SIGN_OUT',

    // Availability & Schedule
    AVAILABILITY = 'AVAILABILITY',
    SCHEDULE = 'SCHEDULE',
    MOVE_DOWN = 'MOVE_DOWN',
    MOVE_UP = 'MOVE_UP',
    MOVE_TOP = 'MOVE_TOP',
    MOVE_BOTTOM = 'MOVE_BOTTOM',
    AVAILABILITY_CHANGE = 'AVAILABILITY_CHANGE',
    MOVE_NEXT_DAY = 'MOVE_NEXT_DAY',
    MOVE_PREVIOUS_DAY = 'MOVE_PREVIOUS_DAY',
    TIMETABLE = 'TIMETABLE',

    // Booking
    SELL = 'SELL',
    NEED = 'NEED',
    RECONFIRM = 'RECONFIRM',
    NAME = 'NAME',
    CONTACT = 'CONTACT',
    SSR = 'SSR',
    TICKET_TIME_LIMIT = 'TICKET_TIME_LIMIT',
    TICKETING_ELEMENT = 'TICKETING_ELEMENT',
    SEAT_REQUEST = 'SEAT_REQUEST',
    SEAT_MAP = 'SEAT_MAP',

    // Pricing & Ticketing
    FARE_QUOTE = 'FARE_QUOTE',
    PRICE = 'PRICE',
    REBOOK_PRICE = 'REBOOK_PRICE',
    TICKET = 'TICKET',
    TICKET_DISPLAY = 'TICKET_DISPLAY',

    // PNR Operations
    RETRIEVE = 'RETRIEVE',
    END_RETRIEVE = 'END_RETRIEVE',
    END_TRANSACTION = 'END_TRANSACTION',
    IGNORE = 'IGNORE',

    // Modifications
    CANCEL_SEGMENT = 'CANCEL_SEGMENT',
    CANCEL_ITINERARY = 'CANCEL_ITINERARY',
    CANCEL_NAME = 'CANCEL_NAME',
    CHANGE_NAME = 'CHANGE_NAME',
    SPLIT_PNR = 'SPLIT_PNR',

    // History & Queue
    HISTORY = 'HISTORY',
    QUEUE_START = 'QUEUE_START',
    QUEUE_DISPLAY = 'QUEUE_DISPLAY',
    QUEUE_EXIT = 'QUEUE_EXIT',

    // Miscellaneous
    OSI = 'OSI',
    REMARK = 'REMARK',
    RECEIVED_FROM = 'RECEIVED_FROM',
    HELP = 'HELP',

    UNKNOWN = 'UNKNOWN',
    DISPLAY_TICKET = 'DISPLAY_TICKET',
    VOID_TICKET = 'VOID_TICKET'
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
