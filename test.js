#!/usr/bin/env node

/**
 * ASMODEUS Test Script
 * Tests all core functionality
 */

const commands = [
    // Sign In
    { cmd: 'JI1234', expected: 'OK' },

    // Availability
    { cmd: 'ANDELDOH', expected: 'AMADEUS AVAILABILITY' },
    { cmd: 'AN12JANDELDOH', expected: 'AMADEUS AVAILABILITY' },

    // Sell
    { cmd: 'SS1Y1', expected: 'HK1' },

    // Name
    { cmd: 'NM1KUMAR/RAHUL MR', expected: 'KUMAR/RAHUL' },

    // Contact
    { cmd: 'AP MUM 9876543210', expected: 'ADDED' },

    // End & Retrieve
    { cmd: 'ER', expected: 'PNR CREATED' },

    // Price
    { cmd: 'FXP', expected: 'FARE CALCULATION' },

    // Ticket
    { cmd: 'TTP', expected: 'TICKET ISSUED' },

    // Sign Out
    { cmd: 'JO', expected: 'SIGNED OUT' }
];

async function runTests() {
    console.log('🧪 ASMODEUS Test Suite\n');
    console.log('Testing complete booking flow...\n');

    let passed = 0;
    let failed = 0;

    for (const test of commands) {
        try {
            const response = await fetch('http://localhost:3000/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: test.cmd })
            });

            const data = await response.json();
            const output = data.output || '';

            if (output.includes(test.expected)) {
                console.log(`✅ ${test.cmd.padEnd(25)} → ${test.expected}`);
                passed++;
            } else {
                console.log(`❌ ${test.cmd.padEnd(25)} → Expected "${test.expected}", got "${output.substring(0, 50)}..."`);
                failed++;
            }
        } catch (err) {
            console.log(`❌ ${test.cmd.padEnd(25)} → ERROR: ${err.message}`);
            failed++;
        }

        // Small delay between commands
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! System is fully functional.');
    } else {
        console.log('\n⚠️  Some tests failed. Check server logs.');
    }
}

// Run tests
runTests().catch(console.error);
