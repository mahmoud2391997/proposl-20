import { GoogleGenAI } from "@google/genai";
import { StoryState, UserProfile } from "../types";

const GEMINI_MODEL = "gemini-2.5-flash";

export const generateStoryNode = async (
  profile: UserProfile,
  previousChoice: string | null,
  context: 'intro' | 'climax'
): Promise<string> => {
  try {
    // Guideline: Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
    // Use non-null assertion (!) as we rely on the define plugin in vite.config.ts to ensure it exists
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    let prompt = "";
    if (context === 'intro') {
      prompt = `You are the Game Master for a high-stakes sci-fi crisis simulation. 
      The user is ${profile.name}, a ${profile.role}.
      Write a short, intense narrative paragraph (max 60 words) setting up a critical situation on a failing space station. 
      The core is becoming unstable. 
      Provide 2 distinct, high-stakes tactical options for the user to proceed.
      Format the output purely as JSON: { "narrative": "...", "options": [{"label": "...", "value": "..."}] }`;
    } else {
      prompt = `The user chose: "${previousChoice}".
      Now, the reactor stabilization minigame has just finished.
      Write a climax narrative paragraph (max 60 words) describing the outcome based on that choice.
      The situation is critical. 
      Provide 2 final ethical or strategic options to resolve the story.
      Format the output purely as JSON: { "narrative": "...", "options": [{"label": "...", "value": "..."}] }`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return JSON.stringify({
      narrative: "Communications offline. Systems critical. Manual override required immediately.",
      options: [
        { label: "Force System Reset", value: "reset" },
        { label: "Evacuate Core", value: "evacuate" }
      ]
    });
  }
};

export const generateAnalysis = async (
  profile: UserProfile,
  storyState: StoryState
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `
      Act as a senior training officer in a futuristic simulation.
      Analyze the performance of Trainee ${profile.name} (${profile.role}).
      
      Data:
      - Initial Tactic: ${storyState.firstChoice}
      - Simulation Efficiency: ${storyState.simulationScore}%
      - Final Decision: ${storyState.secondChoice}

      Provide a 3-paragraph psychological and strategic evaluation.
      1. Analyze their initial instinct.
      2. Evaluate their ability to handle pressure (simulation score).
      3. Judge their final resolution.
      
      Tone: Professional, stern but constructive, immersive.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error", error);
    return "Data corruption detected. Unable to generate psychological profile.";
  }
};