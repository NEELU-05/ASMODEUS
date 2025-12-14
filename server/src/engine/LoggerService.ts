import { pool } from '../db/mysql.js';

export class LoggerService {
    static async logSessionStart(sessionId: string, agentId: string) {
        try {
            await pool.execute(
                'INSERT INTO agent_sessions (session_id, agent_id) VALUES (?, ?)',
                [sessionId, agentId]
            );
        } catch (e) {
            console.error('Failed to log session start:', e);
        }
    }

    static async logSessionEnd(sessionId: string) {
        try {
            await pool.execute(
                'UPDATE agent_sessions SET sign_out_time = CURRENT_TIMESTAMP WHERE session_id = ? AND sign_out_time IS NULL',
                [sessionId]
            );
        } catch (e) {
            console.error('Failed to log session end:', e);
        }
    }

    static async logCommand(sessionId: string, type: string, raw: string) {
        try {
            await pool.execute(
                'INSERT INTO command_logs (session_id, command_type, raw_command) VALUES (?, ?, ?)',
                [sessionId, type, raw]
            );
        } catch (e) {
            // Fail silently for logs to avoid disrupting flow
            // console.error('Log error', e); 
        }
    }
}
