# ASMODEUS - Complete Scenario Solutions
## Testing All 30 Training Scenarios

### Scenario 1: One-way Booking
**Task:** Book 1 pax Delhi to Mumbai.
**Solution:**
```
JI1234
AN12JANDELBOM
SS1Y1
NM1KUMAR/RAHUL MR
AP DEL 9876543210
TK OK
ER
FXP
TTP
```

### Scenario 2: Wrong Class Error
**Task:** Correct invalid class.
**Solution:**
```
JI1234
AN12JANDELDOH
SS1S1 (Error: Invalid Class)
SS1Y1 (Correct)
```

### Scenario 3: Overbooking
**Task:** Handle UC status.
**Solution:**
```
JI1234
AN12JANDELDOH
SS9J1 (System returns UC/LL)
XE1 (Cancel Unconfirmed)
SS2Y1 (Sell fewer)
```

### Scenario 4: Two Passenger Booking
**Task:** Book 2 pax.
**Solution:**
```
JI1234
AN12JANDELDOH
SS2Y1
NM2SHARMA/RAJ MR+SHARMA/PRIYA MS
AP DEL 9876543210
TK OK
ER
FXP
TTP
```

### Scenario 5: Missing Name Field
**Task:** Fix NEED NAME FIELD error.
**Solution:**
```
JI1234
AN12JANDELDOH
SS1Y1
ER (Error: NEED NAME FIELD)
NM1SINGH/VIKRAM MR
ER
```

### Scenario 6: Ignore Booking
**Task:** Discard changes.
**Solution:**
```
JI1234
AN12JANDELDOH
SS1Y1
IG (Working Area Cleared)
```

### Scenario 7: Retrieve PNR
**Task:** Display booking.
**Solution:**
```
RT ABC123
*A (Display All - implied by RT)
```

### Scenario 8: Ticket Without Pricing
**Task:** Fix PNR NOT PRICED.
**Solution:**
```
RT ABC123
TTP (Error: PNR NOT PRICED)
FXP
TTP
```

### Scenario 9: Void Ticket
**Task:** Void ticket.
**Solution:**
```
RT ABC123
TWX (or TRDC)
```

### Scenario 10: Cancel Segment
**Task:** Correct segment.
**Solution:**
```
JI1234
AN12JANDELDOH
SS1Y1
XE1
SS1Y2
```

### Scenario 11: Seat Assignment
**Task:** Assign seat 12A.
**Solution:**
```
RT ABC123
ST/12A
ER
```

### Scenario 12: SSR Entry
**Task:** Add Meal.
**Solution:**
```
RT ABC123
SR VGML
ER
```

### Scenario 13: DOCS Entry
**Task:** Add Passport.
**Solution:**
```
RT ABC123
SR DOCS HK1 P/IN/A1234567/IN/12JAN90/M/12JAN30/PATEL/AMIT
ER
```

### Scenario 14: TTL Expiry
**Task:** Set TKTL.
**Solution:**
```
RT ABC123
TKTL/15JAN
ER
```

### Scenario 15: Reprice Booking
**Task:** Re-price itinerary.
**Solution:**
```
RT ABC123
FXP (Update TST)
```

### Scenario 16: Split PNR
**Task:** Split 1 pax.
**Solution:**
```
RT ABC123
SP1
ER
```

### Scenario 17: Modify Passenger
**Task:** Change Name.
**Solution:**
```
RT ABC123
NU1/1PATEL/SURESH MR
ER
```

### Scenario 18: Queue Handling
**Task:** Queue ops.
**Solution:**
```
QS50C1 (Sign in to Queue 50 Category 1)
QD (Display)
QR (Remove)
QE (Exit)
```

### Scenario 19: Connection Booking
**Task:** Book connecting.
**Solution:**
```
AN12JANDELLHR
SS1Y1
SS1Y2
NM1SMITH/JOHN MR
AP DEL 9123456780
TK OK
ER
```

### Scenario 20: Full Agent Drill
**Task:** End-to-end.
**Solution:**
```
JI1234
AN12JANDELBOM
SS1Y1
NM1TEST/PAX MR
AP DEL 9999999999
TK OK
SR VGML
ST/12F
ER
FXP
TTP
JO
```

### Scenario 21: Group Booking
**Task:** Block space for 15.
**Solution:**
```
NG15A/GROUPNAME
AN12JANDELDOH
SG15Y1
ER
```

### Scenario 22: Intl Multi-City
**Task:** Circle Trip.
**Solution:**
```
AN12JANDELDXB
SS1Y1
AN15JANDXBLHR
SS1Y1
AN20JANLHRDEL
SS1Y1
NM1WANDERER/JOE MR
AP DEL 9898989898
TK OK
ER
FXP
TTP
```

### Scenario 23: Same-Day Change
**Task:** Rebook earlier.
**Solution:**
```
RT ABC123
SB12JANDELBOM
ER
```

### Scenario 24: Upgrade Request
**Task:** Upgrade Y to J.
**Solution:**
```
RT ABC123
SB J 1
FXP
ER
```

### Scenario 25: Waitlist Mgmt
**Task:** Accept Waitlist.
**Solution:**
```
RT ABC123 (Segment status KL)
HK1 (Change status)
ER
```

### Scenario 26: Codeshare Flight
**Task:** Book codeshare.
**Solution:**
```
AN12JANDELDOH
SS1Y2 (Flight operated by QR, marketed by 6E)
*R (Display Remarks)
```

### Scenario 27: Interline Booking
**Task:** Two airlines.
**Solution:**
```
AN12JANDELBOM (AI)
SS1Y1
AN15JANBOMDXB (EK)
SS1Y1
NM1FLYER/INTL MR
TK OK
ER
FXP
TTP
```

### Scenario 28: Unaccompanied Minor
**Task:** Child alone.
**Solution:**
```
NM1KID/JUNIOR MSTR(UMNR)
SR UMNR
OS AI UMNR 8YRS/PARENT CONTACT 999
TK OK
ER
```

### Scenario 29: Pet in Cabin
**Task:** Pet.
**Solution:**
```
NM1PAX/PET MR
SR PETC
ER
```

### Scenario 30: Excess Baggage
**Task:** Extra Bag.
**Solution:**
```
SR XBAG
ER
```
