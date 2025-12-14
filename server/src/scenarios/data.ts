export interface Scenario {
    id: number;
    title: string;
    description: string;
    setup?: string[]; // Commands to auto-run to set up state
    setup?: string[]; // Commands to auto-run to set up state
    goal: string;
    hint?: string;
}

export const SCENARIOS: Scenario[] = [
    {
        id: 1,
        title: "One-way Booking",
        description: "Book 1 passenger from DEL to DOH on 12 JAN, price the booking and issue the ticket.",
        goal: "Book 1 pax, price & ticket",
        hint: "Flow: JI 0001AA -> AN12JANDELDOH -> SS1Y1 -> NM1LAST/FIRST -> AP DEL 91-12345678 -> TK OK -> FXP -> TTP"
    },
    {
        id: 2,
        title: "Wrong Class Error",
        description: "While booking DEL -> DOH (12 JAN), you selected an invalid booking class (e.g. S-Class when only Y is open). Correct the error.",
        goal: "Fix invalid booking class",
        hint: "Only classes displayed in AN are valid (e.g. Y9, J9). If you try SS1S1 and S is closed, you get error. Try SS1Y1 instead."
    },
    {
        id: 3,
        title: "Overbooking",
        description: "Attempt to book more seats than available in a high-demand class for DEL -> DOH and handle the UC/LL status.",
        goal: "Handle no seats available",
        hint: "Try booking more seats than available (e.g. SS9J1 when J2). You might get UC (Unable Closed). You must cancel (XE) and rebook fewer."
    },
    {
        id: 4,
        title: "Two Passenger Booking",
        description: "Create a 2-passenger booking on the same flight from DEL -> DOH (12 JAN) and issue tickets.",
        goal: "Book 2 pax same flight",
        hint: "Sell 2 seats: SS2Y1. Then enter 2 names: NM1NAME/A NM1NAME/B. Each name must match count."
    },
    {
        id: 5,
        title: "Missing Name Field",
        description: "You sold a segment but forgot to enter passenger names. Try to End Transaction (ER) and resolve the error.",
        goal: "Fix NEED NAME FIELD",
        hint: "You cannot End Transaction (ER) without names. Use NM1SURNAME/NAME to add them."
    },
    {
        id: 6,
        title: "Ignore Booking",
        description: "Start a booking, then decide to discard the working area using IG.",
        goal: "Discard working area",
        hint: "Use command IG to Ignore the current changes and clear the screen."
    },
    {
        id: 7,
        title: "Retrieve PNR",
        description: "Retrieve an existing PNR (e.g., create one first, ignore, then retrieve by locator) and display it.",
        goal: "Display saved booking",
        hint: "Use RT <LOCATOR> (e.g. RT ABC123) to retrieve a PNR."
    },
    {
        id: 8,
        title: "Ticket Without Pricing",
        description: "Attempt to issue a ticket (TTP) without pricing the PNR (FXP) first. Fix the PNR NOT PRICED error.",
        goal: "Fix PNR NOT PRICED",
        hint: "You must run FXP (Fare Quote) before TTP (Ticket Issue). This stores the TST."
    },
    {
        id: 9,
        title: "Void Ticket",
        description: "Retrieve a ticketed PNR and void the issued ticket using TRDC/TWX processing.",
        goal: "Cancel issued ticket",
        hint: "TRDC (Ticket Refund/Void) is the command. Use it carefully!"
    },
    {
        id: 10,
        title: "Cancel Segment",
        description: "You selected the wrong flight. Cancel the segment (XE) and sell the correct one.",
        goal: "Cancel flight segment",
        hint: "XE <LINE_NUM> cancels a segment. e.g. XE 3. Then sell new one with SS."
    },
    {
        id: 11,
        title: "Seat Assignment",
        description: "Assign a specific seat (e.g., 12A) to a passenger using ST/12A.",
        goal: "Assign seat to pax",
        hint: "Use ST/12A/S3 (Seat request 12A for segment 3). Or just ST/12A."
    },
    {
        id: 12,
        title: "SSR Entry",
        description: "Add a Special Service Request (e.g., VGML Meal or WCHR Wheelchair) to the PNR.",
        goal: "Add meal / wheelchair",
        hint: "SR VGML (Veg Meal) or SR WCHR (Wheelchair). Can attach to pax: SR VGML/P1"
    },
    {
        id: 13,
        title: "DOCS Entry",
        description: "Add passport details (SSR DOCS) for an international flight passenger.",
        goal: "Add passport details",
        hint: "SR DOCS ... format is complex. Try 'HE SR' for help."
    },
    {
        id: 14,
        title: "TTL Expiry",
        description: "Set a Ticket Time Limit (TK TL) and simulate expiry behavior (requires manual date advancement or imagination).",
        goal: "Handle ticket time limit",
        hint: "TK TL 15JAN sets a time limit. If not ticketed by then, system cancels (simulated)."
    },
    {
        id: 15,
        title: "Reprice Booking",
        description: "Retrieve an old PNR, update itinerary, and recompute the price (FXP) before ticketing.",
        goal: "FXB / FXP/R usage",
        hint: "If itinerary changed, old price is invalid. Run FXP again to store new TST."
    },
    {
        id: 16,
        title: "Split PNR",
        description: "A group of 3 is booked. Split 1 passenger (SP) into a separate PNR.",
        goal: "Separate passengers",
        hint: "SP 2 (Split Pax 2). Then EF (End File) or RF to finalize split."
    },
    {
        id: 17,
        title: "Modify Passenger",
        description: "Change a passenger's name before ticketing (NU/NM correction).",
        goal: "Cancel passenger",
        hint: "You can delete name with XE <NameLine> and add new one. Or use NU (Name Update) if allowed."
    },
    {
        id: 18,
        title: "Queue Handling",
        description: "Sign in to Queue 50 (QS50), process a PNR, and exit (QE).",
        goal: "Work with queues",
        hint: "QS 50 to start queue 50. IG to ignore item, QD to delay."
    },
    {
        id: 19,
        title: "Connection Booking",
        description: "Book a connection: DEL -> LHR -> JFK. Ensure segments are married or contiguous.",
        goal: "Multi-segment booking",
        hint: "SS1Y1 (Del-Lon) then SS1Y1 (Lon-NYC). Amadeus marries them if connection is valid."
    },
    {
        id: 20,
        title: "Full Agent Drill",
        description: "Sign In -> Availability -> Sell -> Name -> Contact -> Ticketing Element -> Price -> Ticket -> Sign Out.",
        goal: "End-to-end booking",
        hint: "Remember the mantra: PRINT (Phone, References, Itinerary, Name, Ticketing). AP, SS, NM, TK, ER."
    },
    {
        id: 21,
        title: "Group Booking",
        description: "Create a group booking (NG) for 15 passengers. (Blocked space).",
        goal: "Handle block space (NG/SG)",
        hint: "NG 15 (Name Group). Usually reserved for airline group logic."
    },
    {
        id: 22,
        title: "Intl Multi-City",
        description: "Book a complex itinerary: DEL -> DXB, DXB -> LON, LON -> NYC.",
        goal: "Complex itinerary & pricing",
        hint: "Price multiple sectors. FXP should auto-price the whole journey."
    },
    {
        id: 23,
        title: "Same-Day Change",
        description: "Passenger wants to move to an earlier flight on the same day. Use Segment Book (SB).",
        goal: "Rebooking urgency (SB)",
        hint: "SB 12DEC (Segment Book new date). Replaces selected segment with new date."
    },
    {
        id: 24,
        title: "Upgrade Request",
        description: "Passenger wants to upgrade from Economy (Y) to Business (J). Rebook and reprice.",
        goal: "Class modification",
        hint: "Cancel Y class segment (XE) and rebook J class (SS1J1). Then reprice."
    },
    {
        id: 25,
        title: "Waitlist Mgmt",
        description: "Sell a Waitlisted seat (LL). Manage the status change when it opens (KL/KK).",
        goal: "Clear waitlist (KL/KK)",
        hint: "If status is HL (Waitlist), you can't ticket. When it opens to KL/KK, use ERK to confirm."
    },
    {
        id: 26,
        title: "Codeshare Flight",
        description: "Book a flight marketed by one airline but operated by another. Explain the PNR remarks.",
        goal: "Marketing vs Operating",
        hint: "Note the '*' next to flight number. Detailed avail (DO) shows 'OPERATED BY...'"
    },
    {
        id: 27,
        title: "Interline Booking",
        description: "Book AI (Air India) and BA (British Airways) in one PNR. Issue a single interline ticket.",
        goal: "Multiple airlines ticketing",
        hint: "Interline agreement needed. FXP will check if readable."
    },
    {
        id: 28,
        title: "Unaccompanied Minor",
        description: "Book a child (CHD) traveling alone. Add mandatory UMNR SSR and parent contact details.",
        goal: "SSR UMNR & handling",
        hint: "SR UMNR (Unaccompanied Minor). You must enter age and guardian contact."
    },
    {
        id: 29,
        title: "Pet in Cabin",
        description: "Book a passenger traveling with a pet. Add PETC SSR and confirm approval.",
        goal: "SSR PETC integration",
        hint: "SR PETC (Pet in Cabin). Restricted by airline/aircraft."
    },
    {
        id: 30,
        title: "Excess Baggage",
        description: "Passenger has extra luggage. Add XBAG SSR and collect payment (simulated).",
        goal: "SSR XBAG entry",
        hint: "SR XBAG (Excess Baggage). Add weight/pieces."
    }
];
