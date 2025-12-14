# ASMODEUS - Amadeus CRS Training Simulator
## Implementation Status

### ✅ COMPLETED (Phase 1)

#### Core Infrastructure
- ✅ Monorepo structure (Node.js/TypeScript + React/Vite)
- ✅ MySQL database schema
- ✅ Express API with session management
- ✅ React terminal UI with scenario panel

#### Date-Driven Flight Generation
- ✅ `DateHashRandom` - Deterministic RNG (same route+date = same flights)
- ✅ `FlightGenerator` - Generates realistic flights with:
  - Random airlines, flight numbers, times
  - Equipment codes (320, 777, 787, etc.)
  - Class inventory (F/J/C/D/R/I/Y/B/M/H/Q/K/L/V/T/S)
  - Direct and connecting flights
  - Day offsets and elapsed time calculation

#### Command Parsing
- ✅ Complete parser for 40+ commands:
  - Session: JI, JO
  - Availability: AN, AD, SN, SD, MD, MU
  - Booking: SS, NN, RR, NM, AP, SR, TKTL
  - Pricing: FQ, FXP, FXB
  - Ticketing: TTP, TWD
  - PNR: RT, ER, ET, IG/IR
  - Modifications: XE, XI, XN, SP
  - History: RH, RHA
  - Queue: QS, QD, QE
  - Misc: OSI, RM, RC, HE

#### Availability Display
- ✅ Realistic Amadeus-style output:
  - Header: `** AMADEUS AVAILABILITY - AN ** LON LONDON.GB ...`
  - Multi-line class display
  - Equipment codes, stops, via points
  - Day offsets (+1), elapsed time (H:MM)

#### Data
- ✅ 40+ airlines from IATA list
- ✅ 55k+ airports from CSV (ready to import)
- ✅ 20 training scenarios defined

### 🚧 IN PROGRESS (Phase 2)

#### Command Processor - Business Logic
Need to implement handlers for:

1. **Availability & Schedule**
   - ✅ AN/AD - Availability (done)
   - ⚠ SN/SD - Schedule (no seat counts)
   - ⚠ MD/MU - Scroll pagination

2. **Booking Operations**
   - ⚠ SS - Sell seats (reduce inventory, add to working area)
   - ⚠ NN - Need seats (hold without confirmation)
   - ⚠ RR - Reconfirm
   - ⚠ NM - Add passenger names
   - ⚠ AP - Add contact details
   - ⚠ SR - Add SSRs (VGML, WCHR, etc.)
   - ⚠ TKTL - Ticket time limit

3. **Pricing & Ticketing**
   - ⚠ FQ/FQD - Fare quote display
   - ⚠ FXP - Price PNR (calculate fare)
   - ⚠ FXB - Rebook & price
   - ⚠ TTP - Issue ticket
   - ⚠ TWD - Display ticket

4. **PNR Operations**
   - ⚠ ER - End & Retrieve (save PNR, generate locator)
   - ⚠ ET - End Transaction (save without retrieve)
   - ⚠ RT - Retrieve PNR
   - ⚠ IG/IR - Ignore (discard working area)

5. **Modifications**
   - ⚠ XE - Cancel segment (release inventory)
   - ⚠ XI - Cancel itinerary
   - ⚠ XN - Cancel name
   - ⚠ SP - Split PNR

6. **History & Queue**
   - ⚠ RH/RHA - Display history
   - ⚠ QS/QD/QE - Queue operations

7. **Miscellaneous**
   - ⚠ OSI - Other service info
   - ⚠ RM - Remarks
   - ⚠ RC - Received from
   - ⚠ HE - Help

#### State Machine
Need to enforce strict PNR lifecycle:
```
Working Area → Sold Segments → Named → Priced → Ticketed
                ↓                ↓        ↓         ↓
              Cancel          Cancel   Void    Display
```

#### Error Messages
Implement harsh, realistic errors:
- `NEED NAME FIELD`
- `NO SEATS AVAILABLE`
- `INVALID CLASS`
- `PNR NOT PRICED`
- `TTL EXPIRED`
- `CHECK ENTRY`

### 📋 TODO (Phase 3)

#### Database Integration
- Import 55k airports from CSV
- Generate random flight schedules
- Implement inventory management
- PNR persistence
- Ticket storage

#### Frontend Enhancements
- Formatted PNR display
- Pricing breakdown display
- Ticket display
- Error highlighting
- Scenario progress tracking

#### Testing & Polish
- Test all 20 scenarios
- Verify state machine
- Check inventory logic
- Validate error messages

## File Structure

```
server/
├── src/
│   ├── engine/
│   │   ├── types.ts (✅ Command types & interfaces)
│   │   ├── CommandParser.ts (✅ Full parser)
│   │   ├── CommandProcessor.ts (⚠ Needs full implementation)
│   │   ├── Session.ts (✅ Session state)
│   │   ├── FlightGenerator.ts (✅ Date-driven flights)
│   │   └── AvailabilityService.ts (✅ AN/AD display)
│   ├── utils/
│   │   └── dateHash.ts (✅ Deterministic RNG)
│   ├── db/
│   │   ├── mysql.ts (✅ Connection pool)
│   │   ├── init.ts (✅ Schema)
│   │   ├── seed.ts (✅ Basic seed)
│   │   └── upgrade.ts (⚠ CSV import)
│   ├── scenarios/
│   │   └── data.ts (✅ 20 scenarios)
│   └── index.ts (✅ Express server)

client/
├── src/
│   ├── components/
│   │   └── CrypticTerminal.tsx (✅ Terminal UI)
│   ├── App.tsx (✅ Layout + scenarios)
│   └── index.css (✅ Dark theme)
```

## Next Immediate Actions

1. **Build Complete CommandProcessor**
   - Implement all command handlers
   - Add state validation
   - Generate realistic responses

2. **Inventory Management**
   - Reduce seats on SS
   - Release seats on XE
   - Check availability before sell

3. **PNR Generation**
   - Generate 6-char locators
   - Save to database
   - Retrieve and display

4. **Pricing Logic**
   - Random fare calculation
   - Tax breakdown
   - Total display

5. **Ticketing**
   - Generate ticket numbers
   - Save to database
   - Display ticket

## Realism Checklist

- ✅ Commands are cryptic (no simplified syntax)
- ✅ Output is dense, fixed-width text
- ✅ Date-driven consistency
- ✅ Multi-line class displays
- ⚠ Harsh error messages (need implementation)
- ⚠ Strict state machine (need implementation)
- ⚠ Inventory management (need implementation)
- ⚠ Full PNR lifecycle (need implementation)
