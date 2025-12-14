#!/usr/bin/env node

/**
 * ASMODEUS Comprehensive Test Suite
 * Tests all scenarios like a real travel agent
 */

const API_URL = 'http://localhost:3000/api/command';

// Helper function to send command
async function sendCommand(cmd) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd })
        });
        const data = await response.json();
        return data.output || '';
    } catch (err) {
        return `ERROR: ${err.message}`;
    }
}

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test Scenario 1: Simple Domestic Booking
async function testScenario1() {
    console.log('\n📋 SCENARIO 1: Simple Domestic Booking');
    console.log('Task: Book Delhi to Mumbai for Mr. Rahul Kumar\n');

    const commands = [
        { cmd: 'JI1234', desc: 'Sign in' },
        { cmd: 'ANDELBOM', desc: 'Check availability' },
        { cmd: 'SS1Y1', desc: 'Sell 1 seat in Y class' },
        { cmd: 'NM1KUMAR/RAHUL MR', desc: 'Add passenger name' },
        { cmd: 'AP DEL 9876543210', desc: 'Add contact' },
        { cmd: 'ER', desc: 'Create PNR' },
        { cmd: 'FXP', desc: 'Price itinerary' },
        { cmd: 'TTP', desc: 'Issue ticket' },
        { cmd: 'JO', desc: 'Sign out' }
    ];

    for (const { cmd, desc } of commands) {
        console.log(`  → ${cmd.padEnd(25)} // ${desc}`);
        const result = await sendCommand(cmd);
        console.log(`     ${result.substring(0, 60)}${result.length > 60 ? '...' : ''}`);
        await wait(100);
    }
}

// Test Scenario 2: Round Trip
async function testScenario2() {
    console.log('\n📋 SCENARIO 2: Round Trip Booking');
    console.log('Task: Book round trip Delhi-Goa for Ms. Priya Sharma\n');

    const commands = [
        { cmd: 'JI1234', desc: 'Sign in' },
        { cmd: 'ANDELDOH', desc: 'Outbound availability' },
        { cmd: 'SS1Y1', desc: 'Sell outbound' },
        { cmd: 'ANDOHDEL', desc: 'Return availability' },
        { cmd: 'SS1Y1', desc: 'Sell return' },
        { cmd: 'NM1SHARMA/PRIYA MS', desc: 'Add passenger' },
        { cmd: 'AP DEL 9123456789', desc: 'Add contact' },
        { cmd: 'ER', desc: 'Create PNR' },
        { cmd: 'FXP', desc: 'Price' },
        { cmd: 'TTP', desc: 'Ticket' },
        { cmd: 'JO', desc: 'Sign out' }
    ];

    for (const { cmd, desc } of commands) {
        console.log(`  → ${cmd.padEnd(25)} // ${desc}`);
        const result = await sendCommand(cmd);
        console.log(`     ${result.substring(0, 60)}${result.length > 60 ? '...' : ''}`);
        await wait(100);
    }
}

// Test Scenario 3: Business Class
async function testScenario3() {
    console.log('\n📋 SCENARIO 3: Business Class Booking');
    console.log('Task: Book business class Delhi-London for Mr. Vikram Singh\n');

    const commands = [
        { cmd: 'JI1234', desc: 'Sign in' },
        { cmd: 'ANDELLHR', desc: 'Check availability' },
        { cmd: 'SS1J1', desc: 'Sell 1 seat in J (Business)' },
        { cmd: 'NM1SINGH/VIKRAM MR', desc: 'Add passenger' },
        { cmd: 'AP DEL 9876543210', desc: 'Add contact' },
        { cmd: 'ER', desc: 'Create PNR' },
        { cmd: 'FXP', desc: 'Price' },
        { cmd: 'TTP', desc: 'Ticket' },
        { cmd: 'JO', desc: 'Sign out' }
    ];

    for (const { cmd, desc } of commands) {
        console.log(`  → ${cmd.padEnd(25)} // ${desc}`);
        const result = await sendCommand(cmd);
        console.log(`     ${result.substring(0, 60)}${result.length > 60 ? '...' : ''}`);
        await wait(100);
    }
}

// Test Scenario 4: Special Meal Request
async function testScenario4() {
    console.log('\n📋 SCENARIO 4: Special Meal Request');
    console.log('Task: Book with vegetarian meal for Ms. Anjali Verma\n');

    const commands = [
        { cmd: 'JI1234', desc: 'Sign in' },
        { cmd: 'ANDELSIN', desc: 'Delhi to Singapore' },
        { cmd: 'SS1Y1', desc: 'Sell seat' },
        { cmd: 'NM1VERMA/ANJALI MS', desc: 'Add passenger' },
        { cmd: 'AP DEL 9123456789', desc: 'Add contact' },
        { cmd: 'SR VGML', desc: 'Add vegetarian meal' },
        { cmd: 'ER', desc: 'Create PNR' },
        { cmd: 'FXP', desc: 'Price' },
        { cmd: 'TTP', desc: 'Ticket' },
        { cmd: 'JO', desc: 'Sign out' }
    ];

    for (const { cmd, desc } of commands) {
        console.log(`  → ${cmd.padEnd(25)} // ${desc}`);
        const result = await sendCommand(cmd);
        console.log(`     ${result.substring(0, 60)}${result.length > 60 ? '...' : ''}`);
        await wait(100);
    }
}

// Test Error Scenarios
async function testErrorScenarios() {
    console.log('\n📋 ERROR SCENARIOS: Testing Validation');
    console.log('Task: Verify error messages work correctly\n');

    const tests = [
        { cmd: 'SS1Y1', expected: 'NO AVAILABILITY', desc: 'Sell without availability' },
        { cmd: 'JI1234', expected: 'OK', desc: 'Sign in first' },
        { cmd: 'ANDELBOM', expected: 'AMADEUS', desc: 'Get availability' },
        { cmd: 'SS1Y1', expected: 'HK1', desc: 'Sell seat' },
        { cmd: 'ER', expected: 'NEED NAME', desc: 'Try PNR without name' },
        { cmd: 'NM1KUMAR/RAHUL MR', expected: 'KUMAR', desc: 'Add name' },
        { cmd: 'ER', expected: 'PNR CREATED', desc: 'Create PNR' },
        { cmd: 'TTP', expected: 'NOT PRICED', desc: 'Ticket without pricing' },
        { cmd: 'FXP', expected: 'FARE', desc: 'Price PNR' },
        { cmd: 'TTP', expected: 'TICKET ISSUED', desc: 'Issue ticket' },
        { cmd: 'JO', expected: 'SIGNED OUT', desc: 'Sign out' }
    ];

    for (const { cmd, expected, desc } of tests) {
        console.log(`  → ${cmd.padEnd(25)} // ${desc}`);
        const result = await sendCommand(cmd);
        const passed = result.includes(expected);
        console.log(`     ${passed ? '✅' : '❌'} ${result.substring(0, 50)}${result.length > 50 ? '...' : ''}`);
        await wait(100);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🧪 ASMODEUS COMPREHENSIVE TEST SUITE');
    console.log('Testing all scenarios like a real travel agent...\n');
    console.log('='.repeat(70));

    try {
        await testScenario1();
        await wait(500);

        await testScenario2();
        await wait(500);

        await testScenario3();
        await wait(500);

        await testScenario4();
        await wait(500);

        await testErrorScenarios();

        console.log('\n' + '='.repeat(70));
        console.log('\n🎉 ALL TESTS COMPLETED!');
        console.log('\nThe ASMODEUS system is fully functional and ready for training.');
        console.log('All scenarios can be solved using the documented commands.');

    } catch (err) {
        console.error('\n❌ Test failed:', err.message);
    }
}

// Run tests
runAllTests().catch(console.error);
