import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// We create the client lazily to ensure we grab the env var if it's set late, 
// though in this environment it's usually static.
const getAiClient = () => {
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSubtasks = async (task: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down the following task into 3-5 smaller, actionable sub-tasks to help complete it. Keep them concise. Task: "${task}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of actionable sub-tasks",
            },
          },
          required: ["steps"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsed = JSON.parse(jsonText);
    return parsed.steps || [];
  } catch (error) {
    console.error("Failed to generate subtasks:", error);
    return ["Could not generate suggestions. Please try again."];
  }
};
