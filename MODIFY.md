# Amadeus System Improvement Plan & Gap Analysis

Based on the **Official Amadeus Training Manual (8689466.pdf)** and a review of the current codebase, the following gaps and required improvements have been identified to reach training parity.

## 1. Command Coverage Gap Analysis

**Current Capabilities:**
- Basic Navigation (`AN`, `AD`)
- Booking (`SS`, `NM`, `AP`)
- PNR Operations (`ER`, `ET`, `RT`, `SP`)
- Pricing & Ticketing (`FXP`, `TTP`)

**Missing Command Families:**
To achieve full realism, the system must expand to include standard Amadeus navigation, strict status code logic, and comprehensive PNR validation.

---

## 2. Phase 1: Core Navigation & Display (High Priority)
*Goal: Move from "scripted" interactions to exploratory navigation.*

### Required Commands:
- **HE / HE <cmd>**: Context-sensitive Help system (Critical for learners).
- **AC / ACR**: Availability Change (e.g., `AC12JAN` to change date without retyping full AN).
- **MN / MY**: Move Next/Previous Day (essential for finding flights).
- **MP / MT / MB**: Move Top/Bottom (Page navigation).
- **SN / SD**: Schedule Display (Frequency based, not availability based).
- **TN**: Timetable display.

---

## 3. Phase 2: Status Codes & Airline Logic (Critical Realism)
*Goal: Simulate realistic airline responses and inventory states.*

**Current State**: Defaults to `HK` (Holding Confirmed).
**Required State**: Implement specific status transitions:
- **DK → HK**: Waitlist to Confirmed.
- **NN → HK/HL**: Need -> Confirmed/Waitlist.
- **LL / KL / KK**: Waitlist confirmations.
- **HX / UN / UC**: Cancellation statuses (Have Cancelled, Unable, Unable/Closed).

**Notifications**:
- Support `ETK` (Electronic Ticket) and `ERK` flags.

---

## 4. Phase 3: PNR Completeness Engine
*Goal: Enforce mandatory elements before PNR creation.*

**Validation Rules**:
The system must **block** `ET`/`ER` commands unless the following elements exist:
1.  **Itinerary** (`SS`)
2.  **Name** (`NM`)
3.  **Contact** (`AP`) -> Error: `NEED AP ELEMENT`
4.  **Ticketing** (`TK`) -> Error: `NEED TK ELEMENT`

✅ **Status: IMPLEMENTED**
- Mandatory element validation added to `CommandProcessor`.
- `ER`/`ET` properly blocked if elements missing.

---

## 5. Phase 4: Ticketing Logic Correction
*Goal: Fix the confusion between PNR elements and Ticketing actions.*

**Critical Distinction**:
- **TK OK**: This is a **PNR Element** (Ticketing Arrangement), NOT a command to issue a ticket. It implies "Ticket OK" or "Ticket Number entered".
- **TTP**: This is the **Action Command** (Ticket Transaction Print) to actually issue the ticket.

**Required Changes**:
- **Parser**: Stop treating `TKOK` as `TICKETING`. Treat it as a data entry command (store in PNR).
- **Processor**: `ER` should fail if a `TK` element is missing.
- **Logic**: `TTP` should only work if the PNR is Priced (`FXP`) and Saved.

✅ **Status: IMPLEMENTED**
- `TK` commands now stored as `TICKETING_ELEMENT`.
- `TTP` validation logic strictly enforces availability of `ticket` and `price`.

---

## 6. Phase 5: Advanced Agent Operations
*Goal: Support complex training scenarios.*

### To Implement:
- **Cancel/Rebook (`XE` / `SB`)**: `SB` (Segment Book) implies changing class/date.
- **Group Booking (`NG` / `SG`)**: Handling blocking of seats for names.
- **SSR & OSI (`SR` / `OS`)**: Expanded support for DOCS/APIS (Mandatory for international).
- **Queue System (`QS` / `QD` / `QI`)**: Essential for workflow training (simulating inbound messages).
- **History (`RH` / `RHA`)**: Audit trail of PNR changes.

---

## 7. Phase 6: Scenario Engine Integration
*Goal: Turn the sandbox into a structured training lab.*

**Logic**:
- Inject scenarios that *force* errors (e.g., "Force Price Check" where `TTP` fails until `FXP` is run).
- **Auto-Queue**: Scenario where PNR is automatically placed on Queue 50 for the student to find.
- **Date Advancement**: Scenarios that simulate time passing to trigger `TK TL` (Ticketing Time Limit) expiry.

---

## 8. Architectural Improvements
*Goal: Separation of concerns.*

1.  **Parser**: Strict cryptic grammar (Grammar-based parser instead of Regex).
2.  **State Machine**: Formal PNR lifecycle states (Created -> Priced -> Ticketed).
3.  **Airline Simulator**: Separate module to decide if a seat request returns `HK`, `UC`, or `NO`.
4.  **Renderer**: Dedicated text formatter to ensure exact character alignment with real Amadeus screens.

---
---
**Verdict**: **Phases 3 and 4 are COMPLETE.** The validation and ticketing logic now matches real-world behavior.
**Next Priority**: **Phase 1 (Navigation)** to add `HE` (Help), `AC`, and `MN/MY`.
