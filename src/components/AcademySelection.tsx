import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Card } from "../ui/components/Card";
import { Button } from "../ui/components/Button";
import { Input } from "../ui/components/Form";
import type { Academy } from "../types";

interface OnboardingProps {
  onComplete: (academyId: string, profile: any) => void;
}

export default function AcademySelection({ onComplete }: OnboardingProps) {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  
  const [profile, setProfile] = useState({
    classLevel: "Class 12",
    stream: "PCM",
    batch: "Regular 2025",
  });

  useEffect(() => {
    const fetchAcademies = async () => {
      const snap = await getDocs(collection(db, "academies"));
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Academy[];
      setAcademies(list);
      setLoading(false);
    };
    fetchAcademies();
  }, []);

  const filtered = academies.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.city.toLowerCase().includes(search.toLowerCase())
  );

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold gradient-text mb-3">Find Your Academy</h1>
          <p className="text-text-dim">Search for your coaching class to join their digital platform</p>
        </div>

        <div className="mb-8">
          <Input 
            placeholder="Search by Academy Name or City (e.g. Pune)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-lg p-6"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-dim">Searching live academies...</div>
        ) : (
          <div className="grid gap-4">
            {filtered.length === 0 ? (
              <Card className="p-10 text-center border-dashed">
                <p className="text-text-dim">No academies found matching "{search}"</p>
                <p className="text-xs mt-2 italic text-primary-light">Tip: Try searching by city</p>
              </Card>
            ) : (
              filtered.map(a => (
                <Card 
                  key={a.id} 
                  className="p-5 cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => {
                    setSelectedAcademy(a);
                    setStep(2);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                        {a.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{a.name}</h3>
                        <p className="text-sm text-text-dim">{a.city} · {a.streams.join(", ")}</p>
                      </div>
                    </div>
                    <span className="text-primary-light text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Select &rarr;
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 animate-slide-up">
      <Card className="p-8">
        <button 
          onClick={() => setStep(1)} 
          className="text-sm text-text-dim hover:text-primary mb-6 flex items-center gap-2"
        >
          &larr; Back to search
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Set Up Your Profile</h2>
          <p className="text-sm text-text-dim">Joining <span className="text-primary font-semibold">{selectedAcademy?.name}</span></p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-dim uppercase mb-2">Class Level</label>
            <select 
              className="w-full glass-card p-4 bg-transparent outline-none border-white/10"
              value={profile.classLevel}
              onChange={(e) => setProfile({ ...profile, classLevel: e.target.value })}
            >
              <option value="Class 11">Class 11 (FYJC)</option>
              <option value="Class 12">Class 12 (SYJC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dim uppercase mb-2">Primary Stream</label>
            <select 
              className="w-full glass-card p-4 bg-transparent outline-none border-white/10"
              value={profile.stream}
              onChange={(e) => setProfile({ ...profile, stream: e.target.value })}
            >
              <option value="PCM">PCM (Engineering)</option>
              <option value="PCB">PCB (Medical)</option>
              <option value="PCMB">PCMB (Both)</option>
            </select>
          </div>

          <Button 
            className="w-full py-4 text-lg"
            onClick={() => onComplete(selectedAcademy!.id, profile)}
          >
            Finish Setup & Enter Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
