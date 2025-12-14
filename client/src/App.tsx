import { useState, useEffect } from 'react';
import { CrypticTerminal } from './components/CrypticTerminal';

interface Scenario {
  id: number;
  title: string;
  description: string;
  goal: string;
}

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => setScenarios(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeScenario && !completedScenarios.includes(activeScenario.id)) {
      if (!startTime) setStartTime(Date.now());
      interval = setInterval(() => {
        if (startTime) setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setStartTime(null);
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeScenario, completedScenarios, startTime]);

  const handleComplete = () => {
    if (activeScenario) {
      setCompletedScenarios([...completedScenarios, activeScenario.id]);
      setStartTime(null);
      setElapsed(0);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-screen w-screen p-4 flex gap-4 bg-[var(--bg-core)]">
      {/* Main Work Area */}
      <div className="w-2/3 h-full">
        <div className="h-8 mb-2 flex items-center justify-between">
          <h1 className="text-[var(--text-accent)] font-bold tracking-wider">AMADEUS <span className="text-white opacity-50">CONNECT</span></h1>
          <div className="text-xs text-gray-500">PRACTICE MODE</div>
        </div>
        <CrypticTerminal />
      </div>

      {/* Side Panel (Widgets) */}
      <div className="w-1/3 h-full flex flex-col gap-4">

        {/* Scenario List */}
        <div className="glass p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
          <h2 className="text-[var(--text-secondary)] mb-2 uppercase text-sm font-bold border-b border-gray-700 pb-1">Practice Scenarios</h2>
          <div className="space-y-2 text-sm text-gray-300 overflow-y-auto flex-1">
            {scenarios.map(s => (
              <div
                key={s.id}
                onClick={() => { setActiveScenario(s); setStartTime(Date.now()); }}
                className={`p-2 rounded cursor-pointer transition-colors flex justify-between items-center ${activeScenario?.id === s.id ? 'bg-[var(--text-accent)] text-[var(--bg-core)] font-bold' : 'hover:bg-[var(--bg-input)]'}`}
              >
                <span>{s.id}. {s.title}</span>
                {completedScenarios.includes(s.id) && <span className="text-green-500">✓</span>}
              </div>
            ))}
            {scenarios.length === 0 && <div className="text-gray-500 italic">Loading scenarios...</div>}
          </div>
        </div>

        {/* Active Scenario Details */}
        <div className="glass p-4 rounded-lg flex-1 overflow-y-auto">
          <h2 className="text-[var(--text-secondary)] mb-2 uppercase text-sm font-bold border-b border-gray-700 pb-1">Current Task</h2>
          {activeScenario ? (
            <div className="text-sm">
              <div className="mb-4">
                <span className="text-[var(--text-accent)] font-bold">TASK:</span>
                <p className="text-gray-300 mt-1 leading-relaxed">{activeScenario.description}</p>
              </div>
              <div>
                <span className="text-green-500 font-bold">GOAL:</span>
                <p className="text-gray-400 mt-1 font-mono text-xs">{activeScenario.goal}</p>
              </div>

              {!completedScenarios.includes(activeScenario.id) ? (
                <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-700 text-center">
                  <div className="text-2xl font-mono text-white mb-2">{formatTime(elapsed)}</div>
                  <button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition-colors w-full uppercase text-sm"
                  >
                    Mark as Complete
                  </button>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded text-center text-green-400 font-bold uppercase">
                  Scenario Completed!
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center mt-10">
              SELECT A SCENARIO TO BEGIN
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
