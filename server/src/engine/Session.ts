import { FlightSegment, Passenger } from './types.js';

export class Session {
    sessionId: string;
    signedIn: boolean = false;
    agentId: string = '';

    area: {
        availabilityResults: any[];
        segments: FlightSegment[];
        passengers: Passenger[];
        contacts: string[];
        remarks: string[];
        osi: string[];
        ssrs: string[];
        seats: string[];
        receivedFrom: string;
        currentPnr: string | null;
        pricedFare: number | null;
        paging: {
            currentStart: number;
            totalItems: number;
            pageSize: number;
        };
    };

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        this.area = {
            availabilityResults: [],
            segments: [],
            passengers: [],
            contacts: [],
            remarks: [],
            osi: [],
            ssrs: [],
            seats: [],
            receivedFrom: '',
            currentPnr: null,
            pricedFare: null,
            paging: { currentStart: 0, totalItems: 0, pageSize: 6 }
        };
    }

    signIn(agentId: string) {
        this.signedIn = true;
        this.agentId = agentId;
    }

    signOut() {
        this.signedIn = false;
        this.agentId = '';
        this.reset();
    }

    reset() {
        this.area = {
            availabilityResults: [],
            segments: [],
            passengers: [],
            contacts: [],
            remarks: [],
            osi: [],
            ssrs: [],
            seats: [],
            receivedFrom: '',
            currentPnr: null,
            pricedFare: null,
            paging: { currentStart: 0, totalItems: 0, pageSize: 6 }
        };
    }
}
