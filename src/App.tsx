import React, { useState, useEffect } from 'react';
import './index.css';
import { fetchQuestions, type Question } from './services/dataService';
import SyllabusSelector from './components/SyllabusSelector';
import TestRunner from './components/TestRunner';
import { generateTestLogic } from './test-engine/generator';

function App() {
  const [view, setView] = useState<'dashboard' | 'syllabus' | 'test' | 'analytics'>('dashboard');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentTest, setCurrentTest] = useState<any>(null);

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  const handleStartTest = (selection: any) => {
    const testData = generateTestLogic(questions, {
      chapterId: selection.chapter,
      topic: selection.topic,
      totalQ: 10,
      examMode: 'MHT-CET',
      diffRatio: { easy: 0.4, medium: 0.4, hard: 0.2 }
    });
    setCurrentTest(testData);
    setView('test');
  };

  if (view === 'test' && currentTest) {
    return <TestRunner testData={currentTest} />;
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-white selection:bg-primary/30 flex flex-col items-center">
      <div className="grid-bg"></div>
      
      {/* Floating Centered Navbar */}
      <nav className="fixed top-8 w-full z-[200] px-4 flex justify-center">
        <div className="glass-card shadow-2xl flex items-center bg-black/40 border-white/10 px-2 py-2">
            <div className="flex items-center gap-3 px-6 py-2 border-r border-white/10 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-lg">Y</div>
              <span className="brand text-xl font-bold tracking-tighter uppercase whitespace-nowrap">YOU <span className="gradient-text">CAN</span></span>
            </div>
            
            <div className="flex items-center px-4 gap-2">
              <button onClick={() => setView('dashboard')} className={`btn-ghost ${view === 'dashboard' ? 'text-primary' : ''}`}>Home</button>
              <button onClick={() => setView('syllabus')} className={`btn-ghost ${view === 'syllabus' ? 'text-primary' : ''}`}>Take Test</button>
              <button className="btn-ghost">Doubts</button>
              <button className="btn-ghost">Results</button>
            </div>

            <div className="pl-4 pr-2 border-l border-white/10 hidden md:block">
              <button className="btn-premium px-6 py-2.5 text-xs">Login</button>
            </div>
        </div>
      </nav>

      {/* Main Content Area - Strictly Centered */}
      <main className="relative z-10 w-full max-w-6xl pt-48 pb-40 px-6 flex flex-col items-center">
        
        {view === 'dashboard' && (
          <div className="w-full flex flex-col items-center space-y-32">
            
            {/* Hero Section - Maximum Impact */}
            <section className="w-full text-center flex flex-col items-center animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-bold uppercase tracking-widest mb-10">
                   <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                   Target MHT-CET 2025
                </div>
                <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1] tracking-tighter max-w-4xl">
                   Master Maharashtra’s <br/>
                   <span className="gradient-text">Top Entrance Exams</span>
                </h1>
                <p className="text-text-dim text-xl md:text-2xl mb-14 leading-relaxed max-w-2xl">
                  Adaptive AI practice for JEE, NEET & CET. <br/>
                  Precision logic for the 2025 Board Syllabus.
                </p>
                <div className="flex flex-col sm:flex-row gap-8">
                  <button onClick={() => setView('syllabus')} className="btn-premium px-16 py-6 text-xl shadow-[0_20px_40px_rgba(139,92,246,0.3)]">Start Practice →</button>
                  <button className="glass-card border-white/20 px-16 py-6 text-xl font-bold hover:bg-white/5 transition-all">View Analytics</button>
                </div>
            </section>

            {/* Pillar Grid */}
            <section className="grid lg:grid-cols-3 gap-10 w-full">
               {[
                 { title: 'Syllabus Sync', desc: 'Auto-mapped to eBalbharati & NCERT text.', icon: '📜' },
                 { title: 'Realtime Doubts', desc: 'Interactive canvas with AI resolution.', icon: '⚡' },
                 { title: 'Performance Heat', desc: 'Identify weak topics in sub-100ms.', icon: '🔥' }
               ].map((item, i) => (
                 <div key={i} className="glass-card p-12 text-center flex flex-col items-center group">
                    <div className="text-5xl mb-8 group-hover:scale-125 transition-transform duration-500">{item.icon}</div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-text-dim leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </section>

            {/* Question Stream Preview */}
            <section className="w-full">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">Precision Question Bank</h2>
                  <p className="text-text-dim">Latest questions from curated Maharashtra Board clusters.</p>
               </div>
               
               <div className="grid lg:grid-cols-2 gap-8 w-full px-4">
                  {questions.slice(0, 4).map((q, idx) => (
                    <div key={idx} className="glass-card p-12 relative group hover:border-primary/50 transition-all overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all"></div>
                       <div className="flex justify-between items-center mb-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/40 px-4 py-1.5 rounded-full">{q.exam_type[0]}</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{q.subject} • {q.chapter}</span>
                       </div>
                       <h4 className="text-2xl font-bold text-white mb-10 leading-relaxed underline decoration-white/5 underline-offset-8">
                         {q.question}
                       </h4>
                       <div className="grid md:grid-cols-2 gap-4">
                         {Object.entries(q.options).map(([key, value]) => (
                           <div key={key} className="glass-card bg-white/5 p-5 text-sm flex items-center hover:bg-primary/5 cursor-pointer transition-all border-white/5">
                              <span className="text-primary font-black mr-4 text-xs">{key}</span> {value}
                           </div>
                         ))}
                       </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-center mt-16">
                  <button className="text-primary font-bold uppercase tracking-widest text-xs border-b-2 border-primary/20 pb-2 hover:border-primary transition-all">Explore 100,000+ Questions Mode →</button>
               </div>
            </section>

          </div>
        )}

        {view === 'syllabus' && (
          <div className="w-full flex justify-center py-10">
            <SyllabusSelector onStartTest={handleStartTest} />
          </div>
        ) }

      </main>

      {/* Structured Footer */}
      <footer className="w-full py-24 border-t border-white/5 flex flex-col items-center bg-black/20">
         <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-xl">Y</div>
            <span className="brand text-3xl font-bold tracking-tighter uppercase">YOU CAN</span>
         </div>
         <div className="flex gap-12 text-xs font-bold text-text-dim mb-16 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-primary">Curriculum</a>
            <a href="#" className="hover:text-primary">AI Resolve</a>
            <a href="#" className="hover:text-primary">Contact</a>
         </div>
         <p className="text-[10px] text-white/10 uppercase tracking-widest">© 2026 YOU CAN ACADEMIC ENGINE • MAHARASHTRA • PCM/PCB</p>
      </footer>
    </div>
  );
}

export default App;
