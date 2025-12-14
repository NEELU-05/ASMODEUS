import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { CommandParser } from './engine/CommandParser.js';
import { CommandProcessor } from './engine/CommandProcessor.js';
import { Session } from './engine/Session.js';
import { checkConnection } from './db/mysql.js';
import { SCENARIOS } from './scenarios/data.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory session store
const sessions = new Map<string, Session>();

// Get or create session
function getSession(sessionId: string): Session {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new Session(sessionId));
    }
    return sessions.get(sessionId)!;
}

// API Routes
app.post('/api/command', async (req: any, res: any) => {
    try {
        const { command, sessionId = 'default' } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command required' });
        }

        const session = getSession(sessionId);
        const intent = CommandParser.parse(command);
        const output = await CommandProcessor.process(session, intent);

        res.json({ output, sessionId });
    } catch (err: any) {
        console.error('Command error:', err);
        res.status(500).json({ error: 'SYSTEM ERROR', details: err.message });
    }
});

// Scenarios endpoint
app.get('/api/scenarios', (req: any, res: any) => {
    res.json(SCENARIOS);
});

// Health check
app.get('/api/health', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Serve React app for all other routes
app.get('*', (req: any, res: any) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
async function startServer() {
    try {
        // Check database connection (optional)
        if (process.env.DB_HOST) {
            await checkConnection();
        } else {
            console.log('ℹ️  Running in memory-only mode (no database)');
        }

        app.listen(PORT, () => {
            console.log(`✅ ASMODEUS Server running on port ${PORT}`);
            console.log(`🌐 Access at: http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
