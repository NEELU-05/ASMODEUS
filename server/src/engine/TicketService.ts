import { pool } from '../db/mysql.js';

export class TicketService {
    static async issueTicket(ticketData: {
        ticketNumber: string;
        pnrLocator: string;
        passengerName: string;
        amount: number;
        agentId: string;
    }): Promise<boolean> {
        try {
            await pool.execute(
                'INSERT INTO tickets (ticket_number, pnr_locator, passenger_name, amount, agent_id) VALUES (?, ?, ?, ?, ?)',
                [ticketData.ticketNumber, ticketData.pnrLocator, ticketData.passengerName, ticketData.amount, ticketData.agentId]
            );
            return true;
        } catch (error) {
            console.error('Failed to issue ticket:', error);
            return false;
        }
    }

    static async getTicketsByPnr(pnrLocator: string): Promise<any[]> {
        const [rows] = await pool.execute('SELECT * FROM tickets WHERE pnr_locator = ?', [pnrLocator]);
        return rows as any[];
    }
}
