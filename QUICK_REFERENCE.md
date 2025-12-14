# ASMODEUS Quick Reference Card

## 🚀 Getting Started
```
npm start                 # Start the system
http://localhost:3000     # Access in browser
```

## 📝 Basic Workflow
```
JI1234                    # 1. Sign in
ANDELBOM                  # 2. Check availability
SS1Y1                     # 3. Sell seat
NM1KUMAR/RAHUL MR        # 4. Add passenger
AP DEL 9876543210        # 5. Add contact
ER                        # 6. Create PNR
FXP                       # 7. Price
TTP                       # 8. Ticket
JO                        # 9. Sign out
```

## 🔑 Essential Commands

### Session
- `JI1234` - Sign in
- `JO` - Sign out

### Availability
- `ANDELBOM` - Availability Delhi-Mumbai
- `AN15JANDELBOM` - With date (15 Jan)
- `AD` - Direct flights only
- `SN` - Schedule (no seats)

### Booking
- `SS1Y1` - Sell 1 seat, Y class, line 1
- `SS2J3` - Sell 2 seats, J class, line 3
- `NN1Y1` - Need (hold) seat

### Passengers
- `NM1KUMAR/RAHUL MR` - Add 1 adult
- `NM2SHAH/AMIT MR+SHAH/PRIYA MS` - Add 2 adults
- `NM1PATEL/AARAV MSTR` - Add child

### Contact
- `AP DEL 9876543210` - Phone
- `AP EMAIL RAHUL@GMAIL.COM` - Email

### Special Requests
- `SR VGML` - Vegetarian meal
- `SR AVML` - Asian veg meal
- `SR WCHR` - Wheelchair
- `SR CHLD` - Child

### PNR Operations
- `ER` - End & Retrieve (create PNR)
- `ET` - End Transaction (save)
- `RT ABC123` - Retrieve PNR
- `IG` - Ignore (clear)

### Pricing & Ticketing
- `FXP` - Price PNR
- `TTP` - Issue ticket
- `TWD` - Display ticket

### Modifications
- `XE1` - Cancel segment 1
- `XI` - Cancel itinerary
- `XN1` - Cancel passenger 1

### Help
- `HE` - Show help

## 🎯 Booking Classes
- `F` - First Class
- `J` - Business Class
- `C` - Business Class
- `Y` - Economy Class
- `B` - Economy Class
- `M` - Economy Class

## 🌍 Common Routes
- `DELBOM` - Delhi to Mumbai
- `DELDOH` - Delhi to Goa
- `DELLHR` - Delhi to London
- `DELDXB` - Delhi to Dubai
- `DELSIN` - Delhi to Singapore
- `BOMBLR` - Mumbai to Bangalore

## ⚠️ Common Errors
- `NO AVAILABILITY IN WORKING AREA` - Run AN first
- `NEED NAME FIELD` - Add NM before ER
- `PNR NOT PRICED` - Run FXP before TTP
- `INVALID LINE NUMBER` - Check availability results
- `NO SEATS AVAILABLE` - Class is full

## 💡 Pro Tips
1. Always sign in first (JI)
2. Check availability before selling (AN)
3. Add names before creating PNR (NM)
4. Price before ticketing (FXP → TTP)
5. Use IG to clear and start over

## 📋 Sample Scenarios

### Domestic One-Way
```
JI1234
ANDELBOM
SS1Y1
NM1KUMAR/RAHUL MR
AP DEL 9876543210
ER
FXP
TTP
```

### Round Trip
```
JI1234
ANDELBOM          # Outbound
SS1Y1
ANBOMDEL          # Return
SS1Y1
NM1SHARMA/PRIYA MS
AP DEL 9123456789
ER
FXP
TTP
```

### Business Class
```
JI1234
ANDELLHR
SS1J1             # J = Business
NM1SINGH/VIKRAM MR
AP DEL 9876543210
ER
FXP
TTP
```

### With Special Meal
```
JI1234
ANDELSIN
SS1Y1
NM1VERMA/ANJALI MS
AP DEL 9123456789
SR VGML           # Vegetarian
ER
FXP
TTP
```

## 🎓 Practice Makes Perfect!
Try all 20 scenarios in `SCENARIO_SOLUTIONS.md`

---
*ASMODEUS - Amadeus Selling Platform Simulator*
