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
