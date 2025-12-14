# ASMODEUS - Complete Scenario Solutions
## Testing All 20 Training Scenarios

### Scenario 1: Simple Domestic Booking
**Task:** Book a one-way ticket from Delhi to Mumbai for Mr. Rahul Kumar on 15th January.

**Solution:**
```
JI1234                          # Sign in as agent
AN15JANDELBOM                   # Check availability Delhi-Mumbai on 15 Jan
SS1Y1                           # Sell 1 seat in Y class from line 1
NM1KUMAR/RAHUL MR              # Add passenger name
AP DEL 9876543210              # Add contact number
ER                              # End and retrieve (create PNR)
FXP                             # Price the itinerary
TTP                             # Issue ticket
```

---

### Scenario 2: Round Trip Booking
**Task:** Book a round trip Delhi to Goa for Ms. Priya Sharma, departing 20th Jan, returning 25th Jan.

**Solution:**
```
JI1234
AN20JANDELDOH                   # Outbound availability
SS1Y1                           # Sell outbound flight
AN25JANDOHDEL                   # Return availability
SS1Y1                           # Sell return flight
NM1SHARMA/PRIYA MS             # Add passenger
AP DEL 9123456789
ER
FXP
TTP
```

---

### Scenario 3: Multi-City Booking
**Task:** Book Delhi → London → Paris → Delhi for Mr. Amit Patel.

**Solution:**
```
JI1234
AN15JANDELLHR                   # Delhi to London
SS1Y1
AN18JANLHRCDG                   # London to Paris
SS1Y1
AN25JANCDGDEL                   # Paris to Delhi
SS1Y1
NM1PATEL/AMIT MR
AP DEL 9988776655
ER
FXP
TTP
```

---

### Scenario 4: Multiple Passengers
**Task:** Book 2 adults and 1 child from Mumbai to Dubai on 10th Feb.

**Solution:**
```
JI1234
AN10FEBBOMDXB
SS3Y1                           # Sell 3 seats
NM2SHAH/RAJESH MR+SHAH/MEERA MS # 2 adults
NM1SHAH/ARYAN MSTR             # 1 child
AP BOM 9876543210
ER
FXP
TTP
```

---

### Scenario 5: Special Meal Request
**Task:** Book Delhi to Singapore with vegetarian meal for Ms. Anjali Verma.

**Solution:**
```
JI1234
AN12MARDELSIN
SS1Y1
NM1VERMA/ANJALI MS
AP DEL 9123456789
SR VGML                         # Vegetarian meal
ER
FXP
TTP
```

---

### Scenario 6: Wheelchair Assistance
**Task:** Book Mumbai to New York with wheelchair for Mr. Suresh Iyer.

**Solution:**
```
JI1234
AN20APRBOMJFK
SS1Y1
NM1IYER/SURESH MR
AP BOM 9988776655
SR WCHR                         # Wheelchair
ER
FXP
TTP
```

---

### Scenario 7: Business Class Booking
**Task:** Book business class Delhi to London for Mr. Vikram Singh.

**Solution:**
```
JI1234
AN15MAYDELLHR
SS1J1                           # J = Business class
NM1SINGH/VIKRAM MR
AP DEL 9876543210
ER
FXP
TTP
```

---

### Scenario 8: Last Minute Booking
**Task:** Book tomorrow's flight Mumbai to Bangalore for Ms. Kavita Reddy.

**Solution:**
```
JI1234
ANBOMBLR                        # No date = today/tomorrow
SS1Y1
NM1REDDY/KAVITA MS
AP BOM 9123456789
TKTL/TODAY                      # Immediate ticketing
ER
FXP
TTP
```

---

### Scenario 9: Group Booking (5 Passengers)
**Task:** Book 5 passengers Delhi to Goa for a corporate trip.

**Solution:**
```
JI1234
AN20JUNDELDOH
SS5Y1                           # 5 seats
NM1GUPTA/RAHUL MR
NM1SHARMA/PRIYA MS
NM1PATEL/AMIT MR
NM1VERMA/NEHA MS
NM1SINGH/VIKRAM MR
AP DEL 9876543210
ER
FXP
TTP
```

---

### Scenario 10: Modify Existing Booking
**Task:** Retrieve PNR ABC123 and cancel segment 2.

**Solution:**
```
JI1234
RT ABC123                       # Retrieve PNR
XE2                             # Cancel segment 2
ER                              # Save changes
```

---

### Scenario 11: Cancel Entire Booking
**Task:** Cancel all segments in PNR XYZ789.

**Solution:**
```
JI1234
RT XYZ789
XI                              # Cancel itinerary
ER
```

---

### Scenario 12: Add Passenger to Existing PNR
**Task:** Add one more passenger to PNR DEF456.

**Solution:**
```
JI1234
RT DEF456
NM1KUMAR/SANJAY MR             # Add new passenger
ER
FXP                             # Re-price
```

---

### Scenario 13: International Flight with Passport
**Task:** Book Delhi to Dubai with passport details for Mr. Rohan Mehta.

**Solution:**
```
JI1234
AN15AUGDELDXB
SS1Y1
NM1MEHTA/ROHAN MR
AP DEL 9876543210
SR DOCS HK1 P/IN/A1234567/IN/15JAN90/M/15JAN30/MEHTA/ROHAN
ER
FXP
TTP
```

---

### Scenario 14: Connecting Flight Booking
**Task:** Book Delhi to New York via London (connecting flight).

**Solution:**
```
JI1234
AN20SEPDELJFK                   # Will show connecting options
SS1Y2                           # Select connecting flight (line 2)
NM1SHARMA/AMIT MR
AP DEL 9123456789
ER
FXP
TTP
```

---

### Scenario 15: Same Day Return
**Task:** Book Mumbai to Pune and back same day for Mr. Anil Desai.

**Solution:**
```
JI1234
AN15JANBOMPNQ                   # Morning flight
SS1Y1
AN15JANPNQBOM                   # Evening flight same day
SS1Y1
NM1DESAI/ANIL MR
AP BOM 9988776655
ER
FXP
TTP
```

---

### Scenario 16: Infant Booking
**Task:** Book 1 adult + 1 infant Delhi to Mumbai.

**Solution:**
```
JI1234
AN20FEBDELBOM
SS1Y1
NM1GUPTA/PRIYA MS              # Adult
NM1GUPTA/AARAV MSTR            # Infant
AP DEL 9876543210
ER
FXP
TTP
```

---

### Scenario 17: Premium Economy Booking
**Task:** Book premium economy Delhi to London for Ms. Neha Kapoor.

**Solution:**
```
JI1234
AN10MARDELLHR
SS1W1                           # W = Premium Economy
NM1KAPOOR/NEHA MS
AP DEL 9123456789
ER
FXP
TTP
```

---

### Scenario 18: Split PNR
**Task:** Split passenger 2 from PNR GHI789 into separate booking.

**Solution:**
```
JI1234
RT GHI789
SP2                             # Split passenger 2
ER
```

---

### Scenario 19: Check Flight Status
**Task:** Check availability for multiple dates Delhi to Dubai.

**Solution:**
```
JI1234
AN15JANDELDXB                   # Check 15 Jan
AN16JANDELDXB                   # Check 16 Jan
AN17JANDELDXB                   # Check 17 Jan
# Select best option
SS1Y1
NM1PATEL/RAHUL MR
AP DEL 9876543210
ER
FXP
TTP
```

---

### Scenario 20: Complex Multi-Segment Booking
**Task:** Book Delhi → Dubai → London → Paris → Delhi for Mr. Vikram Shah.

**Solution:**
```
JI1234
AN15JANDELDXB                   # Leg 1
SS1Y1
AN17JANDXBLHR                   # Leg 2
SS1Y1
AN20JANLHRCDG                   # Leg 3
SS1Y1
AN25JANCDGDEL                   # Leg 4
SS1Y1
NM1SHAH/VIKRAM MR
AP DEL 9876543210
ER
FXP
TTP
```

---

## Error Handling Scenarios

### Scenario 21: Trying to Sell Without Availability
```
JI1234
SS1Y1                           # ERROR: NO AVAILABILITY IN WORKING AREA
```

### Scenario 22: Creating PNR Without Name
```
JI1234
AN15JANDELBOM
SS1Y1
ER                              # ERROR: NEED NAME FIELD
```

### Scenario 23: Ticketing Without Pricing
```
JI1234
AN15JANDELBOM
SS1Y1
NM1KUMAR/RAHUL MR
ER
TTP                             # ERROR: PNR NOT PRICED
```

### Scenario 24: Invalid Segment Number
```
JI1234
AN15JANDELBOM
SS1Y1
XE5                             # ERROR: INVALID SEGMENT NUMBER
```

### Scenario 25: Selling More Seats Than Available
```
JI1234
AN15JANDELBOM
SS10Y1                          # ERROR: NO SEATS AVAILABLE (if only 9 available)
```

---

## Testing Checklist

- ✅ Sign In/Out
- ✅ Availability Search (with/without date)
- ✅ Direct vs Connecting Flights
- ✅ Sell Seats (Economy, Business, First)
- ✅ Add Passenger Names (Single, Multiple)
- ✅ Add Contact Details
- ✅ Add SSRs (Meals, Wheelchair, etc.)
- ✅ Create PNR (ER)
- ✅ Retrieve PNR (RT)
- ✅ Price PNR (FXP)
- ✅ Issue Ticket (TTP)
- ✅ Cancel Segment (XE)
- ✅ Cancel Itinerary (XI)
- ✅ Cancel Name (XN)
- ✅ Ignore Working Area (IG)
- ✅ Error Messages
- ✅ State Validation

---

## Expected Outputs

### Successful Availability Search:
```
** AMADEUS AVAILABILITY - AN ** DEL DELHI.IN              58 SA 15JAN 0000
 1  AI 631  J9 C9 D9 R9 I4 Y9 B9  /DEL   BOM 1  0850      1050   E0/321       2:00
            H9 K9 M9 L9 V4 S4
 2  6E 234  J4 C4 D4 R4 I4 Y9 B9  /DEL   BOM 1  1200      1400   E0/320       2:00
            H9 K9 M9 L9 V4 S4
```

### Successful PNR Creation:
```
PNR CREATED: ABC123

1.KUMAR/RAHUL ADT

1  AI 631 Y 15JAN DELBOM HK1

AP DEL 9876543210
```

### Successful Pricing:
```
FARE CALCULATION
BASE FARE:  INR 25,000
TAXES:      INR 3,750
TOTAL:      INR 28,750
PAX: 1 ADT
```

### Successful Ticketing:
```
TICKET ISSUED
TKT: 176-123456789
PNR: ABC123
FARE: INR 28,750
```

---

## All Scenarios Tested ✅

This document provides complete solutions for all 20 training scenarios plus 5 error handling scenarios, demonstrating the full functionality of the ASMODEUS system.
