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
        receivedFrom: string;
        currentPnr: string | null;
        pricedFare: number | null;
    };

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        this.area = {
            availabilityResults: [],
            segments: [],
            passengers: [],
            contacts: [],
            receivedFrom: '',
            currentPnr: null,
            pricedFare: null
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
            receivedFrom: '',
            currentPnr: null,
            pricedFare: null
        };
    }
}
