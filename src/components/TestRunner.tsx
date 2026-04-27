import React, { useState, useEffect } from 'react';

export default function TestRunner({ testData }: { testData: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(testData.timeLimit);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);

  const q = testData.questions[currentIdx];

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev: number) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative overflow-hidden">
      <div className="grid-bg"></div>
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 relative z-10">
        <div className="flex items-center gap-6">
            <div className="glass-card px-6 py-2 border-primary/30 flex items-center gap-3">
               <span className="text-primary font-bold animate-pulse">● LIVE</span>
               <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm font-medium text-text-dim">
                Mode: <span className="text-white uppercase">{testData.marking.correct === 4 ? 'JEE Precision' : 'MHT-CET Blitz'}</span>
            </div>
        </div>
        <button className="btn-premium px-10 py-3 shadow-[0_0_30px_rgba(139,92,246,0.2)]">Finish Test</button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8 relative z-10">
        {/* Left: Questions Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="glass-card p-10 min-h-[550px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <span className="bg-primary/20 text-primary text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">Question {currentIdx + 1}</span>
                    <span className="text-text-dim text-xs">Chapter: {q.chapter}</span>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => toggleBookmark(q.id)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${bookmarks.includes(q.id) ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-text-dim'}`}>🔖</button>
                    <button onClick={() => toggleFlag(q.id)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${flags.includes(q.id) ? 'bg-accent/20 border-accent text-accent' : 'border-white/10 text-text-dim'}`}>🚩</button>
                 </div>
              </div>

              <h3 className="text-2xl font-bold leading-relaxed mb-12 border-l-4 border-primary pl-8">
                {q.question}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(q.options).map(([key, val]: any) => (
                  <button 
                    key={key}
                    onClick={() => setAnswers({...answers, [q.id]: key})}
                    className={`w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden group ${answers[q.id] === key ? 'bg-primary/20 border-primary border-2 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${answers[q.id] === key ? 'bg-primary text-white' : 'bg-white/10 text-primary'}`}>{key}</span>
                        <span className="font-medium">{val}</span>
                    </div>
                    {answers[q.id] === key && <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-12 pt-8 border-t border-white/5">
              <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} className="flex-1 py-4 glass-card hover:bg-white/10 transition-all font-bold tracking-widest text-sm">PREVIOUS</button>
              <button className="px-8 py-4 glass-card border-accent/20 text-accent font-bold hover:bg-accent/5">REPORT ERROR</button>
              <button onClick={() => setCurrentIdx(prev => Math.min(testData.questions.length - 1, prev + 1))} className="flex-1 py-4 btn-premium font-bold tracking-widest text-sm">SAVE & NEXT</button>
            </div>
          </div>
          
          <div className="glass-card p-6 flex justify-between items-center bg-primary/5 border-primary/20">
             <div className="flex items-center gap-4">
                <span className="text-primary font-bold">Stuck on this?</span>
                <p className="text-sm text-text-dim">Our AI Doubt Solver can explain the Board context for this topic.</p>
             </div>
             <button className="text-primary font-bold hover:underline">Route to AI Doubt →</button>
          </div>
        </div>

        {/* Right: Palette & Analytics */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="glass-card p-8">
             <h4 className="text-xs font-bold text-text-dim uppercase mb-6 tracking-[0.2em]">Exam Navigator</h4>
             <div className="grid grid-cols-5 gap-3">
                {testData.questions.map((_: any, i: number) => {
                  const qId = testData.questions[i].id;
                  const isCurrent = currentIdx === i;
                  const isAnswered = !!answers[qId];
                  const isFlagged = flags.includes(qId);
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => setCurrentIdx(i)}
                      className={`h-11 rounded-xl flex items-center justify-center cursor-pointer font-bold text-sm border transition-all ${isCurrent ? 'border-primary ring-4 ring-primary/20 translate-y-[-2px]' : isFlagged ? 'bg-accent/20 border-accent text-accent' : isAnswered ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
             </div>
             
             <div className="mt-10 grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent"></div> Flagged</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/20"></div> Not Visited</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-primary"></div> Current</div>
             </div>
          </div>
          
          <div className="glass-card p-8 bg-emerald-500/5 border-emerald-500/20">
             <h4 className="text-secondary font-bold text-xs uppercase mb-2">Live Accuracy</h4>
             <p className="text-3xl font-extrabold mb-2">{(Object.keys(answers).length / testData.questions.length * 100).toFixed(0)}%</p>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: `${(Object.keys(answers).length / testData.questions.length * 100)}%` }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
