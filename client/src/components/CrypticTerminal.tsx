import React, { useState, useEffect, useRef } from 'react';

interface TerminalLine {
    type: 'input' | 'output' | 'error';
    content: string;
}

export const CrypticTerminal: React.FC = () => {
    const [history, setHistory] = useState<TerminalLine[]>([]);

    const [input, setInput] = useState('');
    const [sessionId] = useState(() => 'SESS_' + Math.random().toString(36).substr(2, 9));
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.toUpperCase();
        setHistory(prev => [...prev, { type: 'input', content: `> ${cmd}` }]);
        setInput('');

        try {
            // Use relative path - Vite proxy will handle dev, Express static will handle prod
            const res = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd, sessionId })
            });

            const data = await res.json();

            if (data.error) {
                setHistory(prev => [...prev, { type: 'error', content: data.error }]);
            } else {
                setHistory(prev => [...prev, { type: 'output', content: data.response }]);
            }
        } catch (err: any) { // Type as any or delete unused var if not used, or console.error it
            setHistory(prev => [...prev, { type: 'error', content: 'SYSTEM COMMUNICATION ERROR' }]);
        }
    };

    return (
        <div className="flex flex-col h-full glass rounded-lg overflow-hidden p-4 relative">
            <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm space-y-2 mt-6">
                {history.length === 0 && (
                    <div className="text-gray-500">
                        AMADEUS SELLING PLATFORM CONNECT (SIMULATOR)<br />
                        ENTER 'JI' TO SIGN IN...
                    </div>
                )}
                {history.map((line, i) => (
                    <div key={i} className={`
            ${line.type === 'input' ? 'text-gray-400' : ''}
            ${line.type === 'output' ? 'terminal-text' : ''}
            ${line.type === 'error' ? 'text-red-500' : ''}
          `}>
                        {line.content}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 pt-2 relative">
                <span className="text-green-500 font-bold ml-1">&gt;</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    className="input-field relative z-10 bg-transparent flex-1"
                    autoFocus
                    placeholder="ENTER COMMAND"
                />
            </form>
        </div>
    );
};
