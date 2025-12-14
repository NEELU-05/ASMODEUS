import React, { useState, useEffect, useRef } from 'react';

interface TerminalLine {
    type: 'input' | 'output' | 'error';
    content: string;
}

export const CrypticTerminal: React.FC = () => {
    const [history, setHistory] = useState<TerminalLine[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [input, setInput] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [sessionId] = useState(() => 'SESS_' + Math.random().toString(36).substr(2, 9));
    const bottomRef = useRef<HTMLDivElement>(null);

    const COMMANDS = ['AN', 'SS', 'NM', 'AP', 'TK', 'ER', 'ET', 'IG', 'RT', 'FXP', 'TTP', 'HE', 'MD', 'MU', 'RH', 'QS', 'QD', 'QE', 'AC', 'MN', 'MY'];

    const highlightSyntax = (text: string) => {
        let processed = text
            // Highlight Dates (e.g., 12JAN, 05MAR)
            .replace(/(\d{2}[A-Z]{3})/g, '<span class="text-yellow-400">$1</span>')
            // Highlight Status Codes (HK, TK, UC, UN)
            .replace(/\b(HK|TK|UC|UN|KL|KK)\b/g, '<span class="text-green-400 font-bold">$1</span>')
            // Highlight Error Keywords
            .replace(/\b(ERROR|INVALID|CHECK|NO ITIN|NEED)\b/g, '<span class="text-red-400 font-bold">$1</span>')
            // Highlight PNR Locators (Simple 6-char alphanum check might be too eager, so context dependent usually better. Simulating with specific pattern or just letting manual highlights work)
            .replace(/(PNR CREATED: )([A-Z0-9]{6})/g, '$1<span class="text-cyan-400 font-bold text-lg">$2</span>');

        return processed;
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.toUpperCase();
        setHistory(prev => [...prev, { type: 'input', content: `> ${cmd}` }]);
        setCommandHistory(prev => [cmd, ...prev]);
        setHistoryIndex(-1);
        setInput('');
        setSuggestion('');

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
        } catch (err) {
            setHistory(prev => [...prev, { type: 'error', content: 'SYSTEM COMMUNICATION ERROR' }]);
        }
    };

    return (
        <div className="flex flex-col h-full glass rounded-lg overflow-hidden p-4">
            <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm space-y-2">
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
            whitespace-pre-wrap font-mono
          `}>
                        {line.type === 'output' ? (
                            <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line.content) }} />
                        ) : (
                            line.content
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-700 pt-2 relative">
                <span className="text-green-500 font-bold">&gt;</span>
                {suggestion && input && suggestion.startsWith(input) && (
                    <div className="absolute left-6 top-2 text-gray-600 pointer-events-none font-mono">
                        {suggestion}
                    </div>
                )}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setInput(val);
                        // Simple Autocomplete Logic
                        if (val.length >= 1) {
                            const match = COMMANDS.find(c => c.startsWith(val));
                            setSuggestion(match ? match : '');
                        } else {
                            setSuggestion('');
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (historyIndex < commandHistory.length - 1) {
                                const newIndex = historyIndex + 1;
                                setHistoryIndex(newIndex);
                                setInput(commandHistory[newIndex]);
                            }
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (historyIndex > 0) {
                                const newIndex = historyIndex - 1;
                                setHistoryIndex(newIndex);
                                setInput(commandHistory[newIndex]);
                            } else if (historyIndex === 0) {
                                setHistoryIndex(-1);
                                setInput('');
                            }
                        } else if (e.key === 'Tab' && suggestion) {
                            e.preventDefault();
                            setInput(suggestion);
                            setSuggestion('');
                        }
                    }}
                    className="input-field relative z-10 bg-transparent"
                    autoFocus
                    placeholder="ENTER COMMAND"
                />
            </form>
        </div>
    );
};
