import React, { useState, useEffect } from 'react';
import { ScreenStage, UserProfile, StoryState, StoryContent } from './types';
import { CinematicButton } from './components/CinematicButton';
import { SimulationGame } from './components/SimulationGame';
import { generateStoryNode, generateAnalysis } from './services/geminiService';
import { Terminal, Users, PlayCircle, ShieldCheck, Activity, Cpu } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [stage, setStage] = useState<ScreenStage>(ScreenStage.SPLASH);
  const [user, setUser] = useState<UserProfile>({ name: '', role: 'Specialist' });
  const [storyState, setStoryState] = useState<StoryState>({
    firstChoice: null,
    simulationScore: 0,
    secondChoice: null,
    aiFeedback: null,
  });
  
  const [storyContent, setStoryContent] = useState<StoryContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---

  const startExperience = () => setStage(ScreenStage.BRIEFING);

  const finishBriefing = () => setStage(ScreenStage.TEAM_SELECT);

  const confirmTeam = async () => {
    setIsLoading(true);
    // Generate initial story based on user role
    const jsonStr = await generateStoryNode(user, null, 'intro');
    try {
        const content = JSON.parse(jsonStr);
        setStoryContent(content);
        setStage(ScreenStage.STORY_NODE_1);
    } catch (e) {
        // Fallback in case of JSON parse error
        setStoryContent({
            narrative: "Critical Alert: Hull breach detected in Sector 4. Systems are failing rapidly.",
            options: [
                { label: "Seal the Bulkheads", value: "defensive" },
                { label: "Reroute Power to Shields", value: "offensive" }
            ]
        });
        setStage(ScreenStage.STORY_NODE_1);
    }
    setIsLoading(false);
  };

  const handleFirstChoice = (choice: string) => {
    setStoryState(prev => ({ ...prev, firstChoice: choice }));
    setStage(ScreenStage.SIMULATION);
  };

  const handleSimulationComplete = async (score: number) => {
    setStoryState(prev => ({ ...prev, simulationScore: score }));
    setIsLoading(true);
    
    // Generate climax based on performance and first choice
    const jsonStr = await generateStoryNode(user, storyState.firstChoice, 'climax');
    try {
        const content = JSON.parse(jsonStr);
        setStoryContent(content);
        setStage(ScreenStage.STORY_NODE_2);
    } catch (e) {
        setStoryContent({
            narrative: "The reactor stabilizes, but the intruder is still on board.",
            options: [
                { label: "Confront Intruder", value: "confront" },
                { label: "Lockdown Command Deck", value: "lockdown" }
            ]
        });
        setStage(ScreenStage.STORY_NODE_2);
    }
    setIsLoading(false);
  };

  const handleSecondChoice = async (choice: string) => {
    const updatedState = { ...storyState, secondChoice: choice };
    setStoryState(updatedState);
    setIsLoading(true);
    
    const analysis = await generateAnalysis(user, updatedState);
    setStoryState(prev => ({ ...prev, aiFeedback: analysis }));
    setStage(ScreenStage.ANALYSIS);
    setIsLoading(false);
  };

  // --- RENDERERS ---

  // Screen 1: Splash
  if (stage === ScreenStage.SPLASH) {
    return (
      <div className="min-h-screen bg-aether-900 flex flex-col items-center justify-center relative scanline">
        <div className="absolute inset-0 overflow-hidden">
            <img 
                src="https://picsum.photos/1920/1080?grayscale&blur=2" 
                alt="Space Background" 
                className="w-full h-full object-cover opacity-30 scale-105 animate-pulse-slow"
            />
        </div>
        <div className="z-10 text-center space-y-6 max-w-2xl px-4">
          <h1 className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter drop-shadow-lg">
            AETHER <span className="text-aether-500">CRISIS</span>
          </h1>
          <p className="text-xl md:text-2xl text-aether-accent font-sans tracking-widest uppercase">
            Interactive Tactical Training Simulation
          </p>
          <div className="pt-8">
            <CinematicButton onClick={startExperience}>Initialize Protocol</CinematicButton>
          </div>
        </div>
      </div>
    );
  }

  // Screen 2: Briefing
  if (stage === ScreenStage.BRIEFING) {
    return (
      <div className="min-h-screen bg-aether-900 flex items-center justify-center p-8 scanline">
        <div className="max-w-3xl w-full border border-aether-500/30 bg-aether-800/80 backdrop-blur p-12 rounded-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-aether-500 shadow-[0_0_10px_#3b82f6]"></div>
          <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
            <Terminal className="text-aether-500" /> MISSION BRIEFING
          </h2>
          <div className="space-y-4 text-lg text-gray-300 font-sans leading-relaxed">
            <p>
              <strong className="text-white">Year:</strong> 2142<br/>
              <strong className="text-white">Location:</strong> Deep Space Outpost "Horizon"<br/>
              <strong className="text-white">Status:</strong> CRITICAL FAILURE
            </p>
            <p>
              Communication with the outpost has ceased. Telemetry indicates a core reactor instability and a potential hostile bio-incursion.
            </p>
            <p>
              You are the responding officer. Your decisions will determine the survival of the 300 souls on board. The AI will monitor your psychometric response during the simulation.
            </p>
          </div>
          <div className="mt-8 flex justify-end">
            <CinematicButton onClick={finishBriefing}>Acknowledge</CinematicButton>
          </div>
        </div>
      </div>
    );
  }

  // Screen 3: Team/Character Select
  if (stage === ScreenStage.TEAM_SELECT) {
    return (
      <div className="min-h-screen bg-aether-900 flex items-center justify-center p-4 scanline">
        <div className="max-w-4xl w-full">
          <h2 className="text-4xl font-display text-white mb-8 text-center">ESTABLISH IDENTITY</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(['Commander', 'Specialist', 'Diplomat'] as const).map((role) => (
              <div 
                key={role}
                onClick={() => setUser(prev => ({ ...prev, role }))}
                className={`cursor-pointer border-2 p-6 rounded-xl transition-all duration-300 relative overflow-hidden group ${user.role === role ? 'border-aether-500 bg-aether-500/20' : 'border-white/10 bg-white/5 hover:border-white/40'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-700 mb-4 overflow-hidden border-2 border-white/20">
                         {/* Placeholder avatars */}
                        <img 
                            src={`https://picsum.photos/seed/${role}/200`} 
                            alt={role} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                  <h3 className="text-xl font-bold font-display uppercase text-white">{role}</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {role === 'Commander' && "Authority. Tactical Command."}
                    {role === 'Specialist' && "Technical. System Operations."}
                    {role === 'Diplomat' && "Negotiation. Psychology."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="ENTER OPERATIVE NAME" 
              className="w-full bg-black/50 border border-aether-500/50 text-white p-4 text-center font-display uppercase tracking-widest focus:outline-none focus:border-aether-accent"
              value={user.name}
              onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))}
            />
            <div className="mt-8 flex justify-center">
                <CinematicButton 
                    onClick={confirmTeam} 
                    disabled={!user.name}
                >
                   {isLoading ? 'Loading Simulation...' : 'Upload Consciousness'}
                </CinematicButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper for Loading
  if (isLoading) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
            <Cpu className="w-16 h-16 text-aether-500 animate-spin" />
            <div className="text-aether-accent font-display tracking-widest animate-pulse">PROCESSING NEURAL LINK...</div>
        </div>
    );
  }

  // Screen 4 & 6: Narrative Story Nodes
  if ((stage === ScreenStage.STORY_NODE_1 || stage === ScreenStage.STORY_NODE_2) && storyContent) {
    return (
      <div className="min-h-screen bg-black relative flex items-end pb-12 justify-center">
         {/* Immersive Background */}
         <div className="absolute inset-0 z-0">
            <img 
                src={`https://picsum.photos/seed/${stage}/1920/1080?grayscale&blur=4`}
                alt="Scene" 
                className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
         </div>

         <div className="relative z-10 max-w-4xl w-full px-6">
            <div className="flex items-center gap-4 mb-4 text-aether-500">
                <Activity className="animate-pulse" />
                <span className="uppercase tracking-widest text-xs font-bold">Live Feed // {user.role} Eyes Only</span>
            </div>
            
            <p className="text-2xl md:text-4xl font-sans font-light text-white leading-tight mb-12 drop-shadow-md">
                "{storyContent.narrative}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storyContent.options.map((opt, idx) => (
                    <CinematicButton 
                        key={idx} 
                        onClick={() => stage === ScreenStage.STORY_NODE_1 ? handleFirstChoice(opt.label) : handleSecondChoice(opt.label)}
                        variant={idx === 1 ? 'danger' : 'primary'}
                    >
                        {opt.label}
                    </CinematicButton>
                ))}
            </div>
         </div>
      </div>
    );
  }

  // Screen 5: Simulation Game
  if (stage === ScreenStage.SIMULATION) {
    return (
      <div className="min-h-screen bg-aether-900 flex flex-col items-center justify-center p-4">
         <div className="mb-8 text-center">
            <h2 className="text-2xl font-display text-white font-bold mb-2">INTERVENTION REQUIRED</h2>
            <p className="text-gray-400">Stabilize the reactor core manually.</p>
         </div>
         <SimulationGame onComplete={handleSimulationComplete} />
      </div>
    );
  }

  // Screen 7: Analysis
  if (stage === ScreenStage.ANALYSIS) {
    return (
      <div className="min-h-screen bg-aether-900 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="text-aether-success" />
                    PERFORMANCE REVIEW
                </h2>
                <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase">Total Score</div>
                    <div className="text-3xl font-bold text-aether-500">{storyState.simulationScore}/100</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/40 p-4 rounded border-l-2 border-aether-500">
                    <div className="text-xs text-gray-500 uppercase mb-1">Initial Response</div>
                    <div className="text-white font-medium">{storyState.firstChoice}</div>
                </div>
                <div className="bg-black/40 p-4 rounded border-l-2 border-aether-danger">
                    <div className="text-xs text-gray-500 uppercase mb-1">Final Resolution</div>
                    <div className="text-white font-medium">{storyState.secondChoice}</div>
                </div>
            </div>

            <div className="prose prose-invert max-w-none">
                <h3 className="text-aether-accent font-display uppercase tracking-widest text-sm mb-4">AI Officer Assessment</h3>
                <div className="text-gray-300 space-y-4 font-sans leading-relaxed whitespace-pre-wrap">
                    {storyState.aiFeedback}
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <CinematicButton onClick={() => window.location.reload()} variant="ghost">
                    Reset Simulation
                </CinematicButton>
            </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default App;