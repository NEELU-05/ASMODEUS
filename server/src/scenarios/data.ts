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
        title: "One-way Booking",
        description: "Book 1 passenger from DEL to DOH on 12 JAN, price the booking and issue the ticket.",
        goal: "Book 1 pax, price & ticket"
    },
    {
        id: 2,
        title: "Wrong Class Error",
        description: "While booking DEL -> DOH (12 JAN), you selected an invalid booking class (e.g. S-Class when only Y is open). Correct the error.",
        goal: "Fix invalid booking class"
    },
    {
        id: 3,
        title: "Overbooking",
        description: "Attempt to book more seats than available in a high-demand class for DEL -> DOH and handle the UC/LL status.",
        goal: "Handle no seats available"
    },
    {
        id: 4,
        title: "Two Passenger Booking",
        description: "Create a 2-passenger booking on the same flight from DEL -> DOH (12 JAN) and issue tickets.",
        goal: "Book 2 pax same flight"
    },
    {
        id: 5,
        title: "Missing Name Field",
        description: "You sold a segment but forgot to enter passenger names. Try to End Transaction (ER) and resolve the error.",
        goal: "Fix NEED NAME FIELD"
    },
    {
        id: 6,
        title: "Ignore Booking",
        description: "Start a booking, then decide to discard the working area using IG.",
        goal: "Discard working area"
    },
    {
        id: 7,
        title: "Retrieve PNR",
        description: "Retrieve an existing PNR (e.g., create one first, ignore, then retrieve by locator) and display it.",
        goal: "Display saved booking"
    },
    {
        id: 8,
        title: "Ticket Without Pricing",
        description: "Attempt to issue a ticket (TTP) without pricing the PNR (FXP) first. Fix the PNR NOT PRICED error.",
        goal: "Fix PNR NOT PRICED"
    },
    {
        id: 9,
        title: "Void Ticket",
        description: "Retrieve a ticketed PNR and void the issued ticket using TRDC/TWX processing.",
        goal: "Cancel issued ticket"
    },
    {
        id: 10,
        title: "Cancel Segment",
        description: "You selected the wrong flight. Cancel the segment (XE) and sell the correct one.",
        goal: "Cancel flight segment"
    },
    {
        id: 11,
        title: "Seat Assignment",
        description: "Assign a specific seat (e.g., 12A) to a passenger using ST/12A.",
        goal: "Assign seat to pax"
    },
    {
        id: 12,
        title: "SSR Entry",
        description: "Add a Special Service Request (e.g., VGML Meal or WCHR Wheelchair) to the PNR.",
        goal: "Add meal / wheelchair"
    },
    {
        id: 13,
        title: "DOCS Entry",
        description: "Add passport details (SSR DOCS) for an international flight passenger.",
        goal: "Add passport details"
    },
    {
        id: 14,
        title: "TTL Expiry",
        description: "Set a Ticket Time Limit (TK TL) and simulate expiry behavior (requires manual date advancement or imagination).",
        goal: "Handle ticket time limit"
    },
    {
        id: 15,
        title: "Reprice Booking",
        description: "Retrieve an old PNR, update itinerary, and recompute the price (FXP) before ticketing.",
        goal: "FXB / FXP/R usage"
    },
    {
        id: 16,
        title: "Split PNR",
        description: "A group of 3 is booked. Split 1 passenger (SP) into a separate PNR.",
        goal: "Separate passengers"
    },
    {
        id: 17,
        title: "Modify Passenger",
        description: "Change a passenger's name before ticketing (NU/NM correction).",
        goal: "Cancel passenger"
    },
    {
        id: 18,
        title: "Queue Handling",
        description: "Sign in to Queue 50 (QS50), process a PNR, and exit (QE).",
        goal: "Work with queues"
    },
    {
        id: 19,
        title: "Connection Booking",
        description: "Book a connection: DEL -> LHR -> JFK. Ensure segments are married or contiguous.",
        goal: "Multi-segment booking"
    },
    {
        id: 20,
        title: "Full Agent Drill",
        description: "Sign In -> Availability -> Sell -> Name -> Contact -> Ticketing Element -> Price -> Ticket -> Sign Out.",
        goal: "End-to-end booking"
    },
    {
        id: 21,
        title: "Group Booking",
        description: "Create a group booking (NG) for 15 passengers. (Blocked space).",
        goal: "Handle block space (NG/SG)"
    },
    {
        id: 22,
        title: "Intl Multi-City",
        description: "Book a complex itinerary: DEL -> DXB, DXB -> LON, LON -> NYC.",
        goal: "Complex itinerary & pricing"
    },
    {
        id: 23,
        title: "Same-Day Change",
        description: "Passenger wants to move to an earlier flight on the same day. Use Segment Book (SB).",
        goal: "Rebooking urgency (SB)"
    },
    {
        id: 24,
        title: "Upgrade Request",
        description: "Passenger wants to upgrade from Economy (Y) to Business (J). Rebook and reprice.",
        goal: "Class modification"
    },
    {
        id: 25,
        title: "Waitlist Mgmt",
        description: "Sell a Waitlisted seat (LL). Manage the status change when it opens (KL/KK).",
        goal: "Clear waitlist (KL/KK)"
    },
    {
        id: 26,
        title: "Codeshare Flight",
        description: "Book a flight marketed by one airline but operated by another. Explain the PNR remarks.",
        goal: "Marketing vs Operating"
    },
    {
        id: 27,
        title: "Interline Booking",
        description: "Book AI (Air India) and BA (British Airways) in one PNR. Issue a single interline ticket.",
        goal: "Multiple airlines ticketing"
    },
    {
        id: 28,
        title: "Unaccompanied Minor",
        description: "Book a child (CHD) traveling alone. Add mandatory UMNR SSR and parent contact details.",
        goal: "SSR UMNR & handling"
    },
    {
        id: 29,
        title: "Pet in Cabin",
        description: "Book a passenger traveling with a pet. Add PETC SSR and confirm approval.",
        goal: "SSR PETC integration"
    },
    {
        id: 30,
        title: "Excess Baggage",
        description: "Passenger has extra luggage. Add XBAG SSR and collect payment (simulated).",
        goal: "SSR XBAG entry"
    }
];
