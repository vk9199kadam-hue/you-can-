import React, { useState } from 'react';

const SYLLABUS_TREE: any = {
  "Class 12": {
    "Physics": {
      "Rotational Dynamics": ["Moment of Inertia", "Centripetal Force", "Angular Momentum"],
      "Solid State": ["Crystal Systems", "Packing Efficiency", "Defects"]
    },
    "Chemistry": {
      "Chemical Kinetics": ["Rate Laws", "Activation Energy"],
      "Elements": ["p-Block", "d-Block"]
    }
  }
};

export default function SyllabusSelector({ onStartTest }: { onStartTest: (selection: any) => void }) {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<any>({ class: 'Class 12', subject: '', chapter: '', topic: '' });

  const classes = Object.keys(SYLLABUS_TREE);
  const subjects = selection.class ? Object.keys(SYLLABUS_TREE[selection.class]) : [];
  const chapters = selection.subject ? Object.keys(SYLLABUS_TREE[selection.class][selection.subject]) : [];
  const topics = selection.chapter ? SYLLABUS_TREE[selection.class][selection.subject][selection.chapter] : [];

  return (
    <div className="glass-card p-10 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 gradient-text">Test Preparation Engine</h2>
      
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Academic Year</label>
            <select 
              className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
              value={selection.class}
              onChange={(e) => setSelection({...selection, class: e.target.value, subject: '', chapter: '', topic: ''})}
            >
              {classes.map(c => <option key={c} value={c} className="bg-bg">{c} (2025-26)</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Subject Stream</label>
            <select 
              className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
              value={selection.subject}
              onChange={(e) => setSelection({...selection, subject: e.target.value, chapter: '', topic: ''})}
            >
              <option value="" className="bg-bg">Select Subject</option>
              {subjects.map(s => <option key={s} value={s} className="bg-bg">{s}</option>)}
            </select>
          </div>
        </div>

        {selection.subject && (
          <div className="grid grid-cols-2 gap-6 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Target Chapter</label>
              <select 
                className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
                value={selection.chapter}
                onChange={(e) => setSelection({...selection, chapter: e.target.value, topic: ''})}
              >
                <option value="" className="bg-bg">Select Chapter</option>
                {chapters.map(c => <option key={c} value={c} className="bg-bg">{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Specific Concept (Topic)</label>
              <select 
                className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
                value={selection.topic}
                onChange={(e) => setSelection({...selection, topic: e.target.value})}
              >
                <option value="" className="bg-bg">Select Topic</option>
                {topics.map((t: string) => <option key={t} value={t} className="bg-bg">{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-between items-center">
        <p className="text-sm text-text-dim">Selection: <span className="text-white font-bold">{selection.subject || '...'}</span> / <span className="text-white">{selection.chapter || '...'}</span></p>
        <button 
          disabled={!selection.topic}
          onClick={() => onStartTest(selection)}
          className={`btn-premium px-12 py-4 ${!selection.topic ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          Configure Exam Logic →
        </button>
      </div>
    </div>
  );
}
