# Amadeus System Improvement Plan & Gap Analysis

(Aligned with Official Amadeus Training Manual – 8689466.pdf)

## 0. Formatting & Host Display Rule (NEW – FOUNDATIONAL)
**Fixed-Width Host Formatting Rule**

Amadeus uses fixed-column formatting, not free text.

**Rule to implement in the Renderer (not logic):**
Output is rendered in fixed-width columns.
Many fields visually appear as: `AAAAA BBBBB` ONLY PHONE NUMBER
(example: "APDEL 98089 90999")

⚠️ **Important clarification:**
-   This is **NOT** a parsing rule
-   This is a **DISPLAY / RENDERING** rule
-   Logic remains token-based
-   Renderer pads/truncates to fixed widths

**Required Changes:**
-   Add a **Column Formatter** layer:
    -   Pads fields to fixed width
    -   Aligns time, class buckets, equipment
-   Parser must ignore spacing, Renderer must enforce spacing

✅ **This makes screens visually identical to real Amadeus.**

---

## 1. Command Coverage Gap Analysis

**Current Capabilities:**
-   **Availability**: `AN`, `AD`
-   **Booking**: `SS`, `NM`, `AP`
-   **PNR Control**: `ER`, `ET`, `RT`, `SP`
-   **Pricing & Ticketing**: `FXP`, `TTP`

**Gap:**
Missing navigation depth, status realism, and training validation logic.

---

## 2. Phase 1: Core Navigation & Display (HIGH PRIORITY) ✅ PARTIALLY COMPLETE
*Goal: Move from scripted flows to real exploratory navigation, exactly like live Amadeus.*

**Commands:**
| Command | Function | Status |
| :--- | :--- | :--- |
| **HE / HE <CMD>** | Context-sensitive help | ✅ Implemented |
| **AC / ACR** | Change availability parameters | ✅ Implemented |
| **MN / MY** | Move next / previous day | ✅ Implemented |
| **MP / MT / MB** | Page navigation | ✅ Implemented |
| **SN / SD** | Schedule display | Pending |
| **TN** | Timetable | Pending |

**Display Requirement:**
-   All outputs must follow **Fixed-width layout**
-   5–8 character columns
-   Visual spacing preserved by renderer

---

## 3. Phase 2: Status Codes & Airline Logic (CRITICAL) ✅ COMPLETE
*Goal: Simulate real airline host responses.*

**Required Status Transitions:**
| From | To |
| :--- | :--- |
| **DK** | **HK** |
| **NN** | **HK / HL** |
| **LL** | **HK** |
| **KL** | **HK** |
| **HX** | Cancelled |
| **UN** | Unable |
| **UC** | Unable/Closed |

**Flags:**
-   `ETK` – Electronic Ticket
-   `ERK` – End & Redisplay with status

Status logic must be decided by a separate **Airline Simulator** module.

---

## 4. Phase 3: PNR Completeness Engine ✅ COMPLETE

**Mandatory Elements Before ER / ET:**
1.  **Itinerary** (`SS`)
2.  **Name** (`NM`)
3.  **Contact** (`AP`)
4.  **Ticketing Arrangement** (`TK`)

**Errors Implemented:**
-   `NEED NAME FIELD`
-   `NEED AP ELEMENT`
-   `NEED TK ELEMENT`

✅ **Already implemented correctly to match Print-to-PNR workflow.**

---

## 5. Phase 4: Ticketing Logic Correction ✅ COMPLETE

**Correct Distinction (CRITICAL):**
| Item | Type |
| :--- | :--- |
| **TK OK** | **PNR Element** |
| **TK TL12JAN** | **PNR Element** |
| **TTP** | **Action Command** |

**Enforced Rules:**
-   `TK` stored as PNR data
-   `ER` blocked without `TK`
-   `TTP` allowed only if:
    -   PNR saved
    -   PNR priced (`FXP`)

✅ **Matches real Amadeus behavior.**

---

## 6. Phase 5: Advanced Agent Operations
*Goal: Enable exam-grade and airline-training scenarios.*

**To Implement:**
-   **XE / SB**: Cancel & rebook segments
-   **NG / SG**: Group bookings
-   **SR / OS**: SSR & OSI (DOCS/APIS mandatory for international)
-   **QS / QD / QI**: Queue handling
-   **RH / RHA**: History & audit trail

All outputs must respect **fixed-width formatting**.

---

## 7. Phase 6: Scenario Engine Integration
*Goal: Turn system into a structured training lab.*

**Capabilities:**
-   **Forced errors** (e.g., TTP before FXP)
-   **Auto-queue insertion**
-   **Time simulation**:
    -   Trigger `TK TL` expiry
    -   Queue on expiry

Scenarios operate **above** CRS logic, not inside it.

---

## 8. Architectural Improvements
**Required Separation:**

1.  **Parser**:
    -   Grammar-based
    -   Token aware
    -   Ignores spacing

2.  **State Machine**:
    -   PNR lifecycle: `CREATED` → `SAVED` → `PRICED` → `TICKETED`

3.  **Airline Simulator**:
    -   Decides `HK` / `UC` / `UN`

4.  **Renderer (NEW, CRITICAL)**:
    -   Enforces **Fixed-width columns**
    -   5-letter spacing where applicable
    -   Alignment identical to Amadeus screens

---

## 9. Phase 7: Real-World Integrations (Future – Optional)

**Allowed / Recommended:**
-   Sandbox schedule seeding
-   Mock payment approval
-   Training-only email/SMS

**Not Recommended:**
-   Real ATPCO fares
-   Live booking APIs
-   Real payments

---
**Verdict**: Phases 0, 1, 2, 3, 4, 6, 7, 8 are largely complete.
**Next Priority**: **Phase 5 (Advanced Agent Operations - Queues)**.
